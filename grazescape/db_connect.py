import psycopg2
# from configparser import ConfigParser
import configparser
import os
from django.conf import settings
from psycopg2.errors import UniqueViolation


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
        #print(id[0])
        farm_id.append(id[0])
    return farm_id
# updates the users list of farms when they add or delete an operation.
def update_user_farms(user_id, farm_id):
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
# If a fields attributes have been changed.  This function updates the the fields_2 table
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
    print("updating dirty field")
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
def null_out_yield_results(data):
    if data['crop_ro'] == 'pt' and data['value_type'] != 'Grass':
        data['sum_cells'] = None
    if data['crop_ro'] == 'cc' and data['value_type'] != 'Corn Grain':
        data['sum_cells'] = None
    if data['crop_ro'] == 'cg' and data['value_type'] != 'Corn Grain' or 'Soy':
        data['sum_cells'] = None
    if data['crop_ro'] == 'dr' and data['value_type'] != 'Corn Silage' or'Corn Grain' or 'Alfalfa':
        data['sum_cells'] = None
    if data['crop_ro'] == 'cso' and data['value_type'] != 'Corn Silage' or'Soy' or 'Oats':
        data['sum_cells'] = None
# Nulls out yeild totals before new models are run.  This is to ensure that no old yield data is being held onto
def clear_yield_values(field_id):
    cur, conn = get_db_conn()
    nullvalue_list = "grass_yield_tons_per_ac = null, corn_yield_brus_per_ac = null, corn_silage_tons_per_ac = null, soy_yield_brus_per_ac = null, alfalfa_yield_tons_per_acre = null, oat_yield_brus_per_ac = null"
    nullout_text = "UPDATE field_model_results SET "
    sql_where_text = " WHERE field_id = "+ field_id
    yield_clear_text = nullout_text + nullvalue_list + sql_where_text
    print(yield_clear_text)
    try:
        cur.execute(yield_clear_text)
    except Exception as e:
        print(e)
        print(type(e).__name__)
        error = str(e)
        print(error)
        raise
    finally:
        cur.close()
        #actual push to db
        conn.commit()
        conn.close()
#Used to update field model results when models are rerun 
def update_field_results(field_id, scenario_id, farm_id, data, insert_field):
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
    cur, conn = get_db_conn()
    sql_where = " WHERE field_id = %s and scenario_id = %s and farm_id = %s"
    sql_values = ""
    col_name = []
    values = []
    nullvalue_list = "grass_yield_tons_per_ac = null, corn_yield_brus_per_ac = null, corn_silage_tons_per_ac = null, soy_yield_brus_per_ac = null, alfalfa_yield_tons_per_acre = null, oat_yield_brus_per_ac = null"
    nullout_text = "UPDATE field_model_results SET "
    update_text = "UPDATE field_model_results SET "
    if insert_field:
        update_text = "INSERT INTO field_model_results("
        sql_values = " VALUES ("
    values.append(data["sum_cells"])
    if data["value_type"] == 'Grass':
        col_name.append("grass_yield_tons_per_ac")
    if data["value_type"] == 'Corn Grain':
        col_name.append("corn_yield_brus_per_ac")

    if data["value_type"] == 'Corn Silage':
        col_name.append("corn_silage_tons_per_ac")

    if data["value_type"] == 'Soy':
        col_name.append("soy_yield_brus_per_ac")

    if data["value_type"] == 'Alfalfa':
        col_name.append("alfalfa_yield_tons_per_acre")

    if data["value_type"] == 'Oats':
        col_name.append("oat_yield_brus_per_ac")

    if data["value_type"] == 'Rotational Average':
        col_name.append('"rotation_dry_matter_yield_kg-DM/ac/year"')

    if data["value_type"] == 'ploss':
        col_name.append('"P_runoff_lbs_per_acre"')

    if data["value_type"] == 'ero':
        col_name.append("soil_erosion_tons_per_acre")

    if data["value_type"] == 'Curve Number':
        col_name.append("runoff_curve_number")

    if data["value_type"] == 'Runoff':
        rain_event = values[0]
        col_name.append('"event_runoff_0.5_inch"')
        col_name.append('event_runoff_1_inch')
        col_name.append('"event_runoff_1.5_inch"')
        col_name.append('event_runoff_2_inch')
        col_name.append('"event_runoff_2.5_inch"')
        col_name.append('event_runoff_3_inch')
        col_name.append('"event_runoff_3.5_inch"')
        col_name.append('event_runoff_4_inch')
        col_name.append('"event_runoff_4.5_inch"')
        col_name.append('event_runoff_5_inch')
        col_name.append('"event_runoff_5.5_inch"')
        col_name.append('event_runoff_6_inch')
        values = []
        for event in rain_event:
            values.append(event)

    if data["value_type"] == 'insect':
        col_name.append("honey_bee_toxicity")
    else:
        col_name.append("cell_count")
        values.append(data['counted_cells'])
        col_name.append("area")
        values.append(data['area'])


    col_name.append("field_id")
    col_name.append("scenario_id")
    col_name.append("farm_id")

    values.append(field_id)
    values.append(scenario_id)
    values.append(farm_id)
    if not insert_field:
        values.append(field_id)
        values.append(scenario_id)
        values.append(farm_id)

    sql_request = update_text
    for index, col in enumerate(col_name):
        if insert_field:
            sql_request = sql_request + col + ","
            sql_values = sql_values + "%s" + ","
            pass
        else:
            sql_values = sql_values + col + " = %s,"
            pass

    if insert_field:
        # replace last comma in list with a )
        sql_request = sql_request[:-1]
        sql_request = sql_request + ")"
        sql_values = sql_values[:-1]
        sql_values = sql_values + ")"
        sql_request = sql_request + sql_values

    else:
        sql_values = sql_values[:-1]
        sql_values = sql_values + ""
        sql_request = sql_request + sql_values + sql_where
    # https://stackoverflow.com/questions/29186112/postgresql-python-ignore-duplicate-key-exception
    try:

        cur.execute(sql_request, values)
    except UniqueViolation as e:
        print("field already exists in table")
        update_field_results(field_id, scenario_id, farm_id, data, False)

    except Exception as e:
        print(e)
        print(type(e).__name__)

        error = str(e)
        print(error)
        raise
    finally:
        cur.close()
        #actual push to db
        conn.commit()
        conn.close()
#Ran if no models are ran.  This pulls the data from the model results table.
def get_values_db(field_id, scenario_id, farm_id, request,model_run_timestamp):
    cur, conn = get_db_conn()
    runoff_col = ['event_runoff_0.5_inch', 'event_runoff_1_inch',
                  'event_runoff_1.5_inch', 'event_runoff_2_inch',
                  'event_runoff_2.5_inch', 'event_runoff_3_inch',
                  'event_runoff_3.5_inch', 'event_runoff_4_inch',
                  'event_runoff_4.5_inch', 'event_runoff_5_inch',
                  'event_runoff_5.5_inch', 'event_runoff_6_inch']
    model_types = {'yield': {
        "grass_yield_tons_per_ac": {"units": "Yield (tons/acre/year)",
                                    "units_alternate": "'Yield (tons/year'",
                                    "type": "Grass"},
        "corn_yield_brus_per_ac": {"units": "Yield (bushels/ac/year)",
                                   "units_alternate": "Yield (bushels/year)",
                                   "type": "Corn Grain"},
        "corn_silage_tons_per_ac": {"units": "Yield (tons/ac/year)",
                                    "units_alternate": "Yield (tons/year)",
                                    "type": "Corn Silage"},
        "soy_yield_brus_per_ac": {"units": "Yield (bushels/ac/year)",
                                  "units_alternate": "Yield (bushels/year)",
                                  "type": "Soy"},
        "alfalfa_yield_tons_per_acre": {"units": "Yield (tons/ac/year)",
                                        "units_alternate": "Yield (tons/year)",
                                        "type": "Alfalfa"},
        "oat_yield_brus_per_ac": {"units": "Yield (bushels/ac/year)",
                                  "units_alternate": "Yield (bushels/year)",
                                  "type": "Oats"},
        "rotation_dry_matter_yield_kg-DM/ac/year": {
            "units": "Yield (lb-Dry Matter/ac/year)",
            "units_alternate": "Yield (lb-Dry Matter/year)",
            "type": "Rotational Average"}
    },
        'ploss': {
            "P_runoff_lbs_per_acre": {
                "units": "Phosphorus Runoff (lb/acre/year)",
                "units_alternate": "Phosphorus Runoff (lb/year)",
                "type": "ploss"},
            "soil_erosion_tons_per_acre": {
                "units": "Phosphorus Runoff (lb/acre/year)",
                "units_alternate": "Soil Erosion (tons of soil/year",
                "type": "ero"}
        },
        'runoff': {
            "runoff": {"units": "Runoff (in)",
                       "units_alternate": "Runoff (in)", "type": "Runoff"},
            "runoff_curve_number": {"units": "Curve Number",
                                    "units_alternate": "Curve Number",
                                    "type": "Curve Number"}
        },
        'bio': {
            "honey_bee_toxicity": {"units": "Insecticide Index",
                                   "units_alternate": "Insecticide Index",
                                   "type": "insect"}
        }
    }

    return_data = []
    cur.execute('SELECT * from field_model_results,field_2 '
                'where field_model_results.field_id = %s '
                'and field_model_results.scenario_id = %s '
                'and field_model_results.farm_id = %s '
                'and field_2.gid = %s',
                [field_id, scenario_id, farm_id,field_id])
    result = cur.fetchone()
    column_names = [desc[0] for desc in cur.description]
    for model in model_types:
        if model == request.POST.get('model_parameters[model_type]'):
            if result is None:
                # print("the query return no results")
                f_name = request.POST.get('model_parameters[f_name]')
                scen = request.POST.get('model_parameters[scen]')
                data = {  # overall model type crop, ploss, bio, runoff
                    "model_type": model,
                    # specific model for runs with multiple models like corn silage
                    # "value_type": model_types[model][col]["type"],
                    "f_name": f_name,
                    "scen": scen,
                    "scen_id": scenario_id,
                    "field_id": field_id
                }
                return_data.append(data)
            else:
                for col in model_types[model]:
                    if col == "runoff":
                        sum1 = []
                        for run_col in runoff_col:
                            col_index = column_names.index(run_col)
                            sum1.append(result[col_index])
                    else:
                        col_index = column_names.index(col)
                        sum1 = result[col_index]
                    units = model_types[model][col]["units"]
                    units_alternate = model_types[model][col][
                            "units_alternate"]
                    if sum1 is None:
                        sum1 = None
                        units = ""
                        units_alternate = ""
                    col_index = column_names.index("area")
                    area = result[col_index]
                    col_index = column_names.index("cell_count")
                    count = result[col_index]

                    grass_index = column_names.index("grass_speciesval")
                    grass_type = result[grass_index]
                    rot_index = column_names.index("rotation")
                    rotation = result[rot_index]

                    till_index = column_names.index("tillage")
                    tillage = result[till_index]
                    grass_rotation = ""
                    if "pt-" in rotation or "cn-" in rotation:
                        r = rotation.split("-")
                        # rotation = rotation.split("-")[0]
                        grass_rotation = r[1]
                        rotation = r[0]
                    if model == "bio":
                        count = 1
                    f_name = request.POST.get('model_parameters[f_name]')
                    # f_name = "test"
                    scen = request.POST.get('model_parameters[scen]')
                    # scen = "farm"
                    data = {
                        # "extent": [*bounds],
                        # "palette": palette,
                        # "url": model.file_name + ".png",
                        # "values": values_legend,
                        "units": units,
                        "units_alternate": units_alternate ,
                        # overall model type crop, ploss, bio, runoff
                        "model_type": model,
                        # specific model for runs with multiple models like corn silage
                        "value_type": model_types[model][col]["type"],
                        "f_name": f_name,
                        "scen": scen,
                        # "avg": round(avg, 2),
                        "area": area,
                        "counted_cells": count,
                        "sum_cells": sum1,
                        "scen_id": scenario_id,
                        "field_id": field_id,
                        "crop_ro": rotation,
                        "grass_ro": grass_rotation,
                        "grass_type": grass_type,
                        "till": tillage,
                        "model_run_timestamp": model_run_timestamp

                    }
                    return_data.append(data)
    cur.close()
    conn.close()
    return return_data
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
def insert_json_coords(scenario_id,farm_id,coords_array):
    cur, conn = get_db_conn()
    print(scenario_id)
    print(farm_id)
    print(coords_array)
    coords_array = [[-10115640.011618003,5414802.3536429405],[-10115648.965725254,5415103.8085870221],[-10116105.625194993,5415118.7320991009],[-10116111.594599824,5414793.3995356858],[-10115640.011618003,5414802.3536429405]]
    try:
        # cur.execute("""INSERT INTO field_2 
        # (gid,scenario_id,farm_id, geom)
        # VALUES(9999,%s,%s,ST_GeomFromText('MULTIPOLYGON(((-10115640.011618003 5414802.3536429405,-10115648.965725254 5415103.8085870221,-10116105.625194993 5415118.7320991009,-10116111.594599824 5414793.3995356858,-10115640.011618003 5414802.3536429405)))'))""",
        #     (scenario_id,farm_id))
        # cur.execute("""INSERT INTO field_2 
        # (scenario_id,farm_id, geom)
        # VALUES(%s,%s,ST_GeomFromGeoJSON('{"type":"MultiPolygon","coordinates":[[-10115640.011618003,5414802.3536429405],[-10115648.965725254,5415103.8085870221],[-10116105.625194993,5415118.7320991009],[-10116111.594599824,5414793.3995356858],[-10115640.011618003,5414802.3536429405]]}'))""",
        #     (scenario_id,farm_id,coords_array))
        cur.execute("""INSERT INTO field_2 
            (scenario_id,farm_id, geom)
            VALUES(%s,%s,
            ST_GeomFromGML('
                <gml:MultiPolygon xmlns="http://www.opengis.net/gml" srsName="EPSG:3857">
                    <gml:coordinates>
                        -10115640.011618003,5414802.3536429405 -10115648.965725254,5415103.8085870221 -10116105.625194993,5415118.7320991009 -10116111.594599824,5414793.3995356858 -10115640.011618003,5414802.3536429405
                    </gml:coordinates> 
                </gml:MultiPolygon>'))""",
                (scenario_id,farm_id))
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


        # <gml:polygonMember>
        #                 <gml:Polygon srsName="EPSG:3857">
        #                     <gml:exterior>
        #                         <gml:LinearRing srsName="EPSG:3857">
        #                             <gml:posList srsDimension="2">
        #                                 -10115640.011618003,5414802.3536429405 -10115648.965725254,5415103.8085870221 -10116105.625194993,5415118.7320991009 -10116111.594599824,5414793.3995356858 -10115640.011618003,5414802.3536429405
        #                             </gml:posList>
        #                         </gml:LinearRing>
        #                     </gml:exterior>
        #                 </gml:Polygon>
        #             </gml:polygonMember>