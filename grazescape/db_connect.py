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
    params = config()

    # connect to the PostgreSQL server
    print('Connecting to the PostgreSQL database...')
    conn = psycopg2.connect(**params)

    # conn = psycopg2.connect(
    #     host="144.92.98.22",
    #     database="GrazeScape",
    #     user="postgres",
    #     password="postgres"
    # )
    cur = conn.cursor()
    return cur, conn


# execute a statement
# determines if the field_model_results already has the given field with the current scenario and farm
def db_has_field(field_id, scenario_id, farm_id):
    cur, conn = get_db_conn()
    cur.execute('SELECT * from field_model_results '
                'where field_id = %s and scenario_id = %s and farm_id = %s',
                [field_id, scenario_id, farm_id])
    db_result = cur.fetchone()
    # close the communication with the PostgreSQL

    cur.close()
    conn.close()
    return db_result is not None


def update_field(field_id, scenario_id, farm_id, data, insert_field):
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
    update_text = "UPDATE field_model_results SET "
    if insert_field:
        update_text = "INSERT INTO field_model_results("
        sql_values = " VALUES ("
    # cur.execute("""UPDATE table_name
    #     SET column1 = value1, column2 = value2, ...
    #     WHERE condition;
    # """)
    #     cur.execute("INSERT INTO field_model_results(field_id, scenario_id)
    #
    #     VALUES (%s,%s)",(30,40))

    # use sum of cell here so we can average over the whole farm
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
        update_field(field_id, scenario_id, farm_id, data, False)

    except Exception as e:
        print(e)
        print(type(e).__name__)

        error = str(e)
        print(error)
        raise
    cur.close()
    conn.commit()
    conn.close()


def get_values_db(field_id, scenario_id, farm_id, request):
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
    print(result)
    column_names = [desc[0] for desc in cur.description]
    print(column_names)
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
                    print(rotation)
                    print("$$$$$$$$$$$$$$$$$")
                    if "pt-" in rotation or "cn-" in rotation:
                        r = rotation.split("-")
                        print(request.POST.get('model_parameters[f_name]'))
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
                        "grass_ro":grass_rotation,
                        "grass_type": grass_type,
                        "till":tillage

                    }
                    return_data.append(data)
    cur.close()
    conn.close()
    print("Returning the following data!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
    print(return_data)
    return return_data


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
# clean_db()
# cur, conn = get_db_conn()
# cur.execute('SELECT * from scenarios_2')
# db_result = cur.fetchall()
# print(db_result)
# # close the communication with the PostgreSQL
#
# cur.close()
# conn.close()
