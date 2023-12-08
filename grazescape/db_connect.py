from operator import is_
import psycopg2
import re
# from configparser import ConfigParser
import configparser
import os
from django.conf import settings
from psycopg2.errors import UniqueViolation
import threading
import json
from grazescape.model_defintions.model_base import OutputDataNode
import numpy as np

def multifindcoordsJson(string):
    values = []
    # while True:
    begstring = '"coordinates":[[['
    endstring = ']]]},"properties":'
    tmp = string.split(begstring)
    for par in tmp:
        if endstring in par:
            values.append(par.split(endstring)[0])
    print(values)
    return values


# Splits up each incoming polygon from the shapefile into a seperate field.
def multifindcoordsshp(string):
    values = []
    # print(string)
    begstring = 'array([['
    endstring = ']])'
    tmp = string.split(begstring)
    for par in tmp:
        if endstring in par:
            par = par.replace('\n', '')
            values.append(par.split(endstring)[0])
    print(values)
    return values


def config(filename='database.ini', section='postgresql'):
    """

    Parameters
    ----------
    filename
    section

    Returns
    -------

    """
    # create a parser
    parser = configparser.ConfigParser()
    filename = os.path.join(settings.BASE_DIR, 'grazescape', 'database.ini')
    # filename = "database.ini"
    parser.read(filename)
    # get section, default to postgresql
    db = {}
    if parser.has_section(section):
        params = parser.items(section)
        for param in params:
            db[param[0]] = param[1]
    else:
        raise Exception(
            'Section {0} not found in the {1} file'.format(section, filename))

    return db


def get_db_conn():
    # params = config()

    # connect to the PostgreSQL server
    print('Connecting to the PostgreSQL database...')
    # conn = psycopg2.connect(**params)
    db = settings.DATABASES['default']
    conn = psycopg2.connect(
        host=db['HOST'],
        database=db['NAME'],
        user=db['USER'],
        password=db['PASSWORD']
    )
    cur = conn.cursor()
    return cur, conn


# execute a statement
# determines if the field_model_results already has the given field with the current scenario and farm
def db_has_field(field_id):
    cur, conn = get_db_conn()
    cur.execute('SELECT * from field_model_results '
                'where field_id = %s',
                [field_id])
    db_result = cur.fetchone()
    # close the communication with the PostgreSQL
    cur.close()
    conn.close()
    return db_result is not None


# This collects all the operations owned by the user once the owner logs in
def get_user_farms(user_id):
    cur, conn = get_db_conn()
    cur.execute('SELECT farm_id from farm_user '
                'where user_id = %s and (is_owner = true or can_write=true or can_read =true)',
                [user_id])
    db_result = cur.fetchall()
    # close the communication with the PostgreSQL
    cur.close()
    conn.close()
    farm_id = []
    for id in db_result:
        # print(id[0])
        farm_id.append(id[0])
    return farm_id


# updates the users list of farms when they add or delete an operation.
def update_user_farms(user_id, farm_id):
    print("IN UPDATE USER FARMS")
    cur, conn = get_db_conn()
    try:
        cur.execute("""INSERT INTO farm_user 
        (user_id, is_owner, can_read, can_write,farm_id)
        VALUES(%s,%s,%s,%s,%s)""",
                    (user_id, True, True, True, farm_id))
    except Exception as e:
        print(e)
        print(type(e).__name__)

        error = str(e)
        print(error)
        raise
    # close the communication with the PostgreSQL
    finally:
        cur.close()
        conn.commit()
        conn.close()


# If a fields attributes have been changed.  This function updates the fields_2 table
def update_field_dirty(field_id, scenario_id, farm_id):
    """

    Parameters
    ----------
    field_id : int
        The primary key of the field
    scenario_id : int
        The primary key of the current scenario
    farm_id : int
        The primary key of the current farm
    data : request object
        The POST request containing the input parameters to the model
    insert_field : bool
        True if field should be inserted, otherwise field will be updated

    Returns
    -------

    """
    print("updating dirty field", field_id, scenario_id, farm_id)
    cur, conn = get_db_conn()
    values = [field_id, scenario_id, farm_id]
    update_text = "UPDATE field_2 SET is_dirty = false WHERE gid = %s and scenario_id = %s and farm_id = %s"
    try:
        cur.execute(update_text, values)
    except Exception as e:
        print(e)
        print(type(e).__name__)

        error = str(e)
        print(error)
        raise
    finally:
        cur.close()
        conn.commit()
        conn.close()
    # Not in use


def update_field_results_async(field_id, scenario_id, farm_id, data, insert_field):
    download_thread = threading.Thread(target=update_field_results,
                                       args=(field_id, scenario_id, farm_id, data, insert_field))
    download_thread.start()
    # self.threads.append(download_thread)


# Used to update field model results when models are rerun
def update_field_results(field_id, scenario_id, data, sql_data_package, insert_field):
    """

    Parameters
    ----------
    field_id : int
        The primary key of the field
    scenario_id : int
        The primary key of the current scenario
    data : request object
        The POST request containing the input parameters to the model
    insert_field : bool
        True if field should be inserted, otherwise field will be updated

    Returns
    -------

    """
    # create values input
    results_dict = {}
    # print("sql_data_package", sql_data_package)
    for model_output in data:
        results_dict[model_output.model_type] = model_output


    grass = []
    grass_blue = []
    grass_tim = []
    grass_orch = []
    corn = []
    soy = []
    corn_silage = []
    alfalfa = []
    oats = []
    dry_matter = results_dict["Rotational Average"].data[0].tolist()
    if "Grass" in results_dict:
        grass = results_dict["Grass"].data[0].tolist()
    if "Corn Grain" in results_dict:
        corn = results_dict["Corn Grain"].data[0].tolist()
    if "Soy" in results_dict:
        soy = results_dict["Soy"].data[0].tolist()
    if "Corn Silage" in results_dict:
        corn_silage = results_dict["Corn Silage"].data[0].tolist()
    if "Alfalfa" in results_dict:
        alfalfa = results_dict["Alfalfa"].data[0].tolist()
    if "Oats" in results_dict:
        oats = results_dict["Oats"].data[0].tolist()

    if "grass_matrix_Bluegrass-clover" in results_dict:
        grass_blue = results_dict["grass_matrix_Bluegrass-clover"].data[0].tolist()
    if "grass_matrix_Timothy-clover" in results_dict:
        grass_tim = results_dict["grass_matrix_Timothy-clover"].data[0].tolist()
    if "grass_matrix_Orchardgrass-clover" in results_dict:
        grass_orch = results_dict["grass_matrix_Orchardgrass-clover"].data[0].tolist()

    ero = results_dict["ero"].data[0].tolist()
    sci = results_dict["soil_index"].data[0].tolist()
    ploss = results_dict["ploss"].data[0].tolist()
    n_water = results_dict["nwater"].data[0].tolist()
    n_leach = results_dict["nleaching"].data[0].tolist()
    runoff = results_dict["Runoff"].data
    cn = results_dict["Curve Number"].data[0].tolist()
    insect = results_dict["insect"].data[0]
    cost = results_dict["econ"].data[0]

    no_data = sql_data_package["no_data"].tolist()
    x_bound = sql_data_package["x_bound"]
    y_bound = sql_data_package["y_bound"]
    area = sql_data_package["area"]
    p_needs = json.dumps(sql_data_package["p_needs"])

    grass = [float(value) for value in grass]
    grass_blue = [float(value) for value in grass_blue]
    grass_tim = [float(value) for value in grass_tim]
    grass_orch = [float(value) for value in grass_orch]

    dry_matter = [float(value) for value in dry_matter]
    corn = [float(value) for value in corn]
    soy = [float(value) for value in soy]
    corn_silage = [float(value) for value in corn_silage]
    alfalfa = [float(value) for value in alfalfa]
    oats = [float(value) for value in oats]

    ero = [float(value) for value in ero]
    sci = [float(value) for value in sci]
    ploss = [float(value) for value in ploss]

    n_water = [float(value) for value in n_water]
    n_leach = [float(value) for value in n_leach]
    runoff_float = []
    for sublist in runoff:
        float_sublist = [float(number) for number in sublist]
        runoff_float.append(float_sublist)

    cn = [float(value) for value in cn]
    no_data_float = []
    for sublist in no_data:
        float_sublist = [float(number) for number in sublist]
        no_data_float.append(float_sublist)

    cur, conn = get_db_conn()

    values = [
        field_id,
        scenario_id,

        dry_matter,
        grass,
        corn,
        soy,
        corn_silage,
        alfalfa,
        oats,
        ero,
        sci,
        ploss,
        n_water,
        n_leach,
        runoff_float,
        cn,
        float(insect),
        float(cost),
        no_data_float,
        float(x_bound),
        float(y_bound),
        float(area),
        p_needs,
        grass_blue,
        grass_tim,
        grass_orch
    ]

    def convert_to_float(value):
        try:
            return float(value)
        except (ValueError, TypeError):
            # If the conversion fails, return the original value
            return value

    float_list = [convert_to_float(value) for value in values]

    sql_where = f" field_id = {field_id} and scen= {scenario_id}"
    # raise TypeError("test")
    update_script = f"""
        UPDATE
        model_results
        SET
        field_id =%s, scen =%s, 
        dry_matter =%s, grass =%s, corn =%s, soy =%s, corn_silage =%s, alfalfa =%s, oats =%s, ero =%s, sci =%s, 
        ploss =%s, 
        n_water =%s, n_leach =%s, runoff =%s, cn =%s, insect =%s, cost =%s, no_data =%s, x_bound =%s, y_bound =%s, 
        area =%s, p_needs =%s, grass_blue =%s, grass_tim =%s, grass_orch =%s
        WHERE {sql_where};
    """

    if insert_field:
        update_script = """
    INSERT INTO model_results(
        field_id, scen, dry_matter, grass, corn, soy, corn_silage, alfalfa, oats,
        ero, sci, ploss, n_water, n_leach, runoff, cn, insect, cost, no_data, x_bound,
        y_bound, area, p_needs, grass_blue, grass_tim, grass_orch)
    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
            %s, %s, %s, %s, %s, %s, %s, %s)
"""
    # https://stackoverflow.com/questions/29186112/postgresql-python-ignore-duplicate-key-exception
    try:
        cur.execute(update_script, float_list)
        print("saving results")
        # raise TypeError("just a test")
    except UniqueViolation as e:
        print("field already exists in table")
        update_field_results(field_id, scenario_id, data, False)

    except Exception as e:
        print(e)
        print(type(e).__name__)

        error = str(e)
        print(error)
        raise
    finally:
        cur.close()
        # actual push to db
        conn.commit()
        conn.close()


# Ran if no models are ran.  This pulls the data from the model results table.
def get_values_db(field_id, scenario_id):
    cur, conn = get_db_conn()
    result = []
    descrip = []
    print("getting ids", field_id, scenario_id)
    try:
        cur.execute('SELECT * from model_results where field_id = %s and scen = %s '
                    ,
                    [field_id, scenario_id])
        result = cur.fetchone()
        descrip = cur.description
    except Exception as e:
        print(e)
        print(type(e).__name__)

        error = str(e)
        print(error)
        raise
    finally:
        cur.close()
        conn.commit()
        conn.close()
    return result, descrip


def format_db_values(sql_model_data, descrip):
    return_data = []
    econ = OutputDataNode("econ", "Production costs ($/ac/year)", "Production costs ($/year)",
                          "Production costs", "Production costs")
    erosion = OutputDataNode("ero", "Soil loss (tons/ac/yr)", "Soil loss (tons/yr)", "Soil loss (tons/ac/yr)",
                             "Soil loss (tons/yr)")
    corn = OutputDataNode("Corn Grain", "Corn grain yield [bu/ac/yr]", "Corn grain production [bu/yr]",
                          "Corn grain yield [bushels/ac/yr]", "Corn grain production [bushels/yr]")

    soy = OutputDataNode("Soy", "Soybean yield (bushels/ac/yr)", "Soybean production (bu/yr)",
                         'Soybean yield (bushels/ac/yr)', "Soybean production (bushels/yr)")

    silage = OutputDataNode("Corn Silage", "Corn silage yield (tons/ac/yr)", "Corn silage production (tons/yr)",
                            "Corn silage yield (tons/ac/yr)", "Corn silage production (tons/yr)")

    alfalfa = OutputDataNode("Alfalfa", "Alfalfa yield (tons/ac/yr)", "Alfalfa production (tons/yr)",
                             "Alfalfa yield (tons/ac/yr)", "Alfalfa production (tons/yr)")

    oats = OutputDataNode("Oats", "Oat yield (bushels/ac/yr)", "Oat production (bu/yr)",
                          "Oat yield (bushels/ac/yr)", "Oat production (bushels/yr)")
    rotation_avg = OutputDataNode("Rotational Average", "Total dry matter yield (tons/ac/yr)",
                                  "Total dry matter production (tons/yr)", "Total dry matter yield (tons/ac/yr)",
                                  "Total dry matter production (tons/yr)")
    grass_yield = OutputDataNode("Grass", "Grass yield (tons-dry-matter/ac/yr)",
                                 'Grass production (tons-dry-matter/yr)', 'Grass yield (tons-dry-matter/ac/yr)',
                                 'Grass production (tons-dry-matter/yr)')
    grass_blue = OutputDataNode("grass_matrix_Bluegrass-clover", "Grass yield (tons-dry-matter/ac/yr)",
                                'Grass production (tons-dry-matter/yr)', 'Grass yield (tons-dry-matter/ac/yr)',
                                'Grass production (tons-dry-matter/yr)')
    grass_tim = OutputDataNode("grass_matrix_Timothy-clover", "Grass yield (tons-dry-matter/ac/yr)",
                               'Grass production (tons-dry-matter/yr)', 'Grass yield (tons-dry-matter/ac/yr)',
                               'Grass production (tons-dry-matter/yr)')
    grass_orch = OutputDataNode("grass_matrix_Orchardgrass-clover", "Grass yield (tons-dry-matter/ac/yr)",
                                'Grass production (tons-dry-matter/yr)', 'Grass yield (tons-dry-matter/ac/yr)',
                                'Grass production (tons-dry-matter/yr)')

    nitrate = OutputDataNode("nleaching", "Nitrate-N leaching (lb/ac/yr)", "Nitrate-N leaching (lb/yr)",
                             "Nitrate-N leaching (lb/ac/yr)", "Nitrate-N leaching (lb/yr)")
    nitrate_water = OutputDataNode("nwater", "Total Nitrogen Loss To Water (lb/ac/yr)",
                                   "Total Nitrogen Loss To Water (lb/yr)",
                                   "Total Nitrogen Loss To Water (lb/ac/yr)",
                                   "Total Nitrogen Loss To Water (lb/yr)")
    pl = OutputDataNode("ploss", "P runoff (lb/ac/yr)", "P runoff (lb/yr)", "Phosphorus runoff (lb/ac/yr)",
                        "Phosphorus runoff (lb/yr)")
    rain_fall = OutputDataNode("Runoff", "Runoff (in)", "Runoff (in)", "Storm event runoff (inches)",
                               "Storm event runoff (inches)")
    curve = OutputDataNode("Curve Number", "Curve Number", "Curve Number", "Composite curve number",
                           "Composite curve number")
    sci_output = OutputDataNode("soil_index", "Soil Condition Index (lb/ac/yr)", "Soil Condition Index (lb/yr)",
                                "Soil Condition Index (lb/ac/yr)", "Soil Condition Index (lb/yr)")
    insect_node = OutputDataNode("insect", "Insecticide Index", "Insecticide Index", "Honey bee toxicity",
                                 "Honey bee toxicity")

    # result = cur.fetchone()
    column_names = [desc[0] for desc in descrip]
    # print("model results", sql_model_data)
    # print("columns", column_names)
    db_dict = {}
    for index, val in enumerate(column_names):
        # print(column_names[index], sql_model_data[index])
        db_dict[column_names[index]] = sql_model_data[index]
    # cur.close()
    # conn.close()

    return_data = [erosion, insect_node, sci_output, curve, rain_fall, pl, nitrate_water, nitrate, rotation_avg, econ]
    erosion.set_data(db_dict["ero"])
    insect_node.set_data(db_dict["insect"])
    sci_output.set_data(db_dict["sci"])
    curve.set_data(db_dict["cn"])
    rain_fall.data = db_dict["runoff"]
    pl.set_data(db_dict["ploss"])
    nitrate_water.set_data(db_dict["n_water"])
    nitrate.set_data(db_dict["n_leach"])
    rotation_avg.set_data(db_dict["dry_matter"])
    econ.set_data(db_dict["cost"])

    corn.set_data(db_dict["corn"])
    soy.set_data(db_dict["soy"])
    silage.set_data(db_dict["corn_silage"])
    alfalfa.set_data(db_dict["alfalfa"])
    oats.set_data(db_dict["oats"])

    grass_yield.set_data(db_dict["grass"])
    grass_blue.set_data(db_dict["grass_blue"])
    grass_tim.set_data(db_dict["grass_tim"])
    grass_orch.set_data(db_dict["grass_orch"])

    if db_dict["corn"]:
        return_data.append(corn)
    if db_dict["soy"]:
        return_data.append(soy)
    if db_dict["corn_silage"]:
        return_data.append(silage)
    if db_dict["alfalfa"]:
        return_data.append(alfalfa)
    if db_dict["oats"]:
        return_data.append(oats)

    if db_dict["grass"]:
        return_data.append(grass_yield)
    if db_dict["grass_blue"]:
        return_data.append(grass_blue)
    if db_dict["grass_tim"]:
        return_data.append(grass_tim)
    if db_dict["grass_orch"]:
        return_data.append(grass_orch)

    return return_data, {"x": int(db_dict["x_bound"]), "y": int(db_dict["y_bound"])}, db_dict["no_data"], db_dict[
        "p_needs"]


# SQl calls for clean data
def clean_db():
    cur, conn = get_db_conn()
    # delete scenario if farm doesnt exist
    cur.execute('DELETE FROM scenarios_2 '
                'WHERE scenarios_2.farm_id NOT IN (SELECT id FROM farm_2)')
    conn.commit()
    # delete field if farm doesn't exist
    cur.execute('DELETE FROM field_2 '
                'WHERE field_2.farm_id NOT IN (SELECT id FROM farm_2)')
    conn.commit()
    # delete field if farm doesn't exist
    cur.execute('DELETE FROM farm_user '
                'WHERE farm_user.farm_id NOT IN (SELECT id FROM farm_2)')
    conn.commit()
    # delete field if parent scenario doesn't exist
    cur.execute('DELETE FROM field_2 '
                'WHERE field_2.scenario_id NOT IN (SELECT scenario_id FROM scenarios_2)')
    conn.commit()
    # delete model result if field doesnt exist
    cur.execute('DELETE FROM field_model_results '
                'WHERE field_model_results.field_id NOT IN (SELECT gid FROM field_2)')
    conn.commit()

    # cur.execute("SELECT field_name, gid "
    #             "FROM field_2 "
    #             "WHERE field_2.farm_id in (SELECT id FROM farm_2)")
    # result = cur.fetchall()
    # print(result)
    cur.close()
    conn.close()


def insert_json_coords(scenario_id, farm_id, file_data):
    tillage = "su"
    tillage_disp = "Spring Cultivation"
    grass_speciesdisp = "Low Yielding"
    grass_speciesval = "Bluegrass-clover"
    cover_crop = 'nc'
    cover_crop_disp = 'No Cover'
    field_name = "(imported field)"
    rotation = "cc"
    rotation_disp = "Continuous Corn"
    rotational_freq_val = 0.65
    rotational_freq_disp = 'Continuous'
    grazingdensityval = "lo"
    grazingdensitydisp = "low"
    spread_confined_manure_on_pastures = False
    on_contour = False
    interseeded_clover = False
    is_dirty = True
    soil_p = 35
    om = 2.0
    land_cost = 140
    coord_strings = multifindcoordsJson(file_data)
    print(coord_strings)

    # This is how the data looks when it comes into this function.
    # [-10115640.011618003,5414802.3536429405],[-10115648.965725254,5415103.8085870221],[-10116105.625194993,5415118.7320991009],[-10116111.594599824,5414793.3995356858],[-10115640.011618003,5414802.3536429405]
    # -10115640.011618003 5414802.3536429405,-10115648.965725254 5415103.8085870221,-10116105.625194993 5415118.7320991009,-10116111.594599824 5414793.3995356858,-10115640.011618003 5414802.3536429405
    # VALUES(%s,%s,%s,ST_GeomFromText('MULTIPOLYGON(((%s)))'))""",

    # ,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s
    # ,tillage_disp,grass_speciesdisp,grass_speciesval,cover_crop,cover_crop_disp,field_name,rotation,rotation_disp,rotational_freq_disp,rotational_freq_val,grazingdensityval,grazingdensitydisp,spread_confined_manure_on_pastures,on_contour,interseeded_clover,pasture_grazing_rot_cont,is_dirty,soil_p,om

    # This goes through the coords string, and sets it up to get pushed into the GeoServer db.
    for coord in coord_strings:
        coord = "[" + coord + "]"
        coord = coord.replace(',', ' ')
        coord = coord.replace('] [', ',')
        coord = coord.replace('[', '')
        coord = coord.replace(']', '')
        coord = "MULTIPOLYGON(((" + coord + ")))"
        print("coord")
        print(coord)
        print("coord")
        postgreSQL_select_Query = "SELECT MAX(gid) FROM field_2;"
        cur, conn = get_db_conn()
        try:
            # first get highest GID value
            print("GETTING LAST GID!!!!!!!!!!")
            cur.execute(postgreSQL_select_Query)
            lastGID = cur.fetchall()
            # Pushes largest GID +1 for new field
            next_gid = lastGID[0][0] + 1
            cur.execute("""INSERT INTO field_2 
            (gid,scenario_id,farm_id, geom, tillage,tillage_disp,grass_speciesdisp,grass_speciesval,cover_crop,cover_crop_disp,field_name,rotation,rotation_disp,rotational_freq_disp,rotational_freq_val,grazingdensityval,grazingdensitydisp,spread_confined_manure_on_pastures,on_contour,interseeded_clover,is_dirty,soil_p,om,land_cost)
            VALUES(%s,%s,%s,ST_GeomFromText(%s),%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)""",
                        (next_gid, scenario_id, farm_id, coord, tillage, tillage_disp, grass_speciesdisp,
                         grass_speciesval, cover_crop, cover_crop_disp, field_name, rotation, rotation_disp,
                         rotational_freq_disp, rotational_freq_val, grazingdensityval, grazingdensitydisp,
                         spread_confined_manure_on_pastures, on_contour, interseeded_clover, is_dirty, soil_p, om,
                         land_cost))

            # Resets the GID counter for the fields_2 field in the db
            cur.execute(
                """SELECT setval(pg_get_serial_sequence('field_2','gid'), coalesce(max(gid), 0) , false) FROM field_2;""")
            # for ref
            # SELECT setval(pg_get_serial_sequence('table_name', 'id'), coalesce(max(id), 0)+1 , false) FROM table_name;
            # cur.execute("""ALTER SEQUENCE field_2_gid_seq RESTART WITH %s;"""

        except Exception as e:
            print(e)
            print(type(e).__name__)

            error = str(e)
            print("GEOJSON UPLOAD FAILED IN db_connect!!")
            print(error)
            raise
        # close the communication with the PostgreSQL
        finally:
            cur.close()
            conn.commit()
            conn.close()


def insert_shpfile_coords(scenario_id, farm_id, file_data):
    print("insert_shpfile_coords")
    print(scenario_id)
    print(farm_id)
    print(file_data)
    # attribute set up
    tillage = "su"
    tillage_disp = "Spring Cultivation"
    grass_speciesdisp = "Low Yielding"
    grass_speciesval = "Bluegrass-clover"
    cover_crop = 'nc'
    cover_crop_disp = 'No Cover'
    field_name = "(imported field)"
    rotation = "cc"
    rotation_disp = "Continuous Corn"
    rotational_freq_val = 0.65
    rotational_freq_disp = 'Continuous'
    grazingdensityval = "lo"
    grazingdensitydisp = "low"
    spread_confined_manure_on_pastures = False
    on_contour = False
    interseeded_clover = False
    is_dirty = True
    soil_p = 35
    om = 2.0
    land_cost = 140
    coord_array_string = str(file_data)
    coord_strings = multifindcoordsshp(coord_array_string)
    print("insert_shpfile_coords coord_strings")

    # [-10117019.10216057,   5375516.61168973],
    #         [-10117008.60306279,   5375090.22832491],
    #         [-10117389.19649813,   5375093.84153498],
    #         [-10117444.31690059,   5375650.31213941],
    #         [-10117370.82299353,   5375650.31213941],
    #         [-10117173.96427018,   5375538.29258033],
    #         [-10117019.10216057,   5375516.61168973]

    # ,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s
    # ,tillage_disp,grass_speciesdisp,grass_speciesval,cover_crop,cover_crop_disp,field_name,rotation,rotation_disp,rotational_freq_disp,rotational_freq_val,grazingdensityval,grazingdensitydisp,spread_confined_manure_on_pastures,on_contour,interseeded_clover,pasture_grazing_rot_cont,is_dirty,soil_p,om

    # series of string replacements
    for coord in coord_strings:
        coord = "[" + coord + "]"
        coord = coord.replace(',', ' ')
        coord = coord.replace(']/n         [', ',')
        coord = coord.replace('[', '')
        coord = coord.replace(']', '')
        coord = coord.replace('      ', ',')
        coord = coord.replace('    ', ' ')
        coord = coord.replace(',   ', ',')
        coord = "MULTIPOLYGON(((" + coord + ")))"
        print("coord")
        print(coord)
        # setting up SQL quiry to place new field into db

        # Getting highest GID from fields to make sure there isnt a duplicate.
        postgreSQL_select_Query = "SELECT MAX(gid) FROM field_2;"
        cur, conn = get_db_conn()
        try:
            print("GETTING LAST GID!!!!!!!!!!")
            cur.execute(postgreSQL_select_Query)
            # Gets all the fields data from the db
            lastGID = cur.fetchall()
            # lastGID[0][0] references the GID value in the fields table.  This gets that valu +1 to prevent a dup
            next_gid = lastGID[0][0] + 1
            # actual excution of SQL query to place fields.
            cur.execute("""INSERT INTO field_2 
            (gid,scenario_id,farm_id, geom, tillage,tillage_disp,grass_speciesdisp,grass_speciesval,cover_crop,cover_crop_disp,field_name,rotation,rotation_disp,rotational_freq_disp,rotational_freq_val,grazingdensityval,grazingdensitydisp,spread_confined_manure_on_pastures,on_contour,interseeded_clover,is_dirty,soil_p,om,land_cost)
            VALUES(%s,%s,%s,ST_GeomFromText(%s),%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)""",
                        (next_gid, scenario_id, farm_id, coord, tillage, tillage_disp, grass_speciesdisp,
                         grass_speciesval, cover_crop, cover_crop_disp, field_name, rotation, rotation_disp,
                         rotational_freq_disp, rotational_freq_val, grazingdensityval, grazingdensitydisp,
                         spread_confined_manure_on_pastures, on_contour, interseeded_clover, is_dirty, soil_p, om,
                         land_cost))
            # Resets the primary key value for the field_2 table after insert of new fields.  This makes sure that new fields being created
            # on other farms do not end up with a duplicate GID to the ones just inserted via shapefile.
            cur.execute(
                """SELECT setval(pg_get_serial_sequence('field_2','gid'), coalesce(max(gid), 0) , false) FROM field_2;""")




        except Exception as e:
            print(e)
            print(type(e).__name__)

            error = str(e)
            print("SHAPEFILE UPLOAD FAILED IN db_connect!!")
            print(error)
            raise
        # close the communication with the PostgreSQL
        finally:
            cur.close()
            conn.commit()
            conn.close()
