import psycopg2
# from configparser import ConfigParser
import configparser
import os
from django.conf import settings

def config(filename='database.ini', section='postgresql'):
    # create a parser
    parser = configparser.ConfigParser()
    filename = os.path.join(settings.BASE_DIR,'grazescape','database.ini')
    # filename = "database.ini"
    parser.read(filename)
    # get section, default to postgresql
    db = {}
    if parser.has_section(section):
        params = parser.items(section)
        for param in params:
            db[param[0]] = param[1]
    else:
        raise Exception('Section {0} not found in the {1} file'.format(section, filename))

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
    print(conn)
    cur = conn.cursor()
    return cur, conn

# execute a statement
# determines if the field_model_results already has the given field with the current scenario and farm
def db_has_field(field_id, scenario_id, farm_id):
    cur, conn = get_db_conn()
    cur.execute('SELECT * from field_model_results '
                'where field_id = %s and scenario_id = %s and farm_id = %s',
                [field_id,scenario_id,farm_id])
    db_result = cur.fetchone()
    print("the result of the field model check")
    print(db_result)
    print(db_result is None)
    # close the communication with the PostgreSQL

    cur.close()
    conn.close()
    return db_result is not None


def update_field(field_id, scenario_id, farm_id, data, insert_field):
    cur, conn = get_db_conn()
    sql_request = ""
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

    col_name.append("area")
    col_name.append("cell_count")

    values.append(data['area'])
    values.append(data['counted_cells'])

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
            sql_values = sql_values +"%s" + ","
            pass
        else:
            sql_values = sql_values + col + " = %s,"
            pass

    if insert_field:
        sql_request = sql_request[:-1]
        sql_request = sql_request + ")"
        sql_values = sql_values[:-1]
        sql_values = sql_values + ")"
        sql_request = sql_request + sql_values

    else:
        sql_values = sql_values[:-1]
        sql_values = sql_values + ""
        sql_request = sql_request + sql_values + sql_where
    print(sql_request)
    print(values)
    cur.execute(sql_request,values)




    cur.close()
    conn.commit()
    conn.close()
# get_db_conn()


def get_values_db(field_id, scenario_id, farm_id, request):
    cur, conn = get_db_conn()
    runoff_col = ['event_runoff_0.5_inch', 'event_runoff_1_inch',
                  'event_runoff_1.5_inch', 'event_runoff_2_inch',
                  'event_runoff_2.5_inch', 'event_runoff_3_inch',
                  'event_runoff_3.5_inch', 'event_runoff_4_inch',
                  'event_runoff_4.5_inch', 'event_runoff_5_inch',
                  'event_runoff_5.5_inch', 'event_runoff_6_inch']
    model_types = {'yield':{
            "grass_yield_tons_per_ac":{"units":"Yield (tons/acre/year)","units_alternate":"'Yield (tons/year'","type":"Grass"},
            "corn_yield_brus_per_ac":{"units":"Yield (bushels/ac/year)","units_alternate":"Yield (bushels/year)","type":"Corn Grain"},
            "corn_silage_tons_per_ac":{"units":"Yield (tons/ac/year)","units_alternate":"Yield (tons/year)","type":"Corn Silage"},
            "soy_yield_brus_per_ac":{"units":"Yield (bushels/ac/year)","units_alternate":"Yield (bushels/year)","type":"Soy"},
            "alfalfa_yield_tons_per_acre":{"units":"Yield (tons/ac/year)","units_alternate":"Yield (tons/year)","type":"Alfalfa"},
            "oat_yield_brus_per_ac":{"units":"Yield (bushels/ac/year)","units_alternate":"Yield (bushels/year)","type":"Oats"},
            "rotation_dry_matter_yield_kg-DM/ac/year":{"units":"Yield (lb-Dry Matter/ac/year)","units_alternate":"Yield (lb-Dry Matter/year)","type":"Rotational Average"}
        },
        'ploss':{
            "P_runoff_lbs_per_acre":{"units":"Phosphorus Runoff (lb/acre/year)","units_alternate":"Phosphorus Runoff (lb/year)","type":"ploss"},
            "soil_erosion_tons_per_acre":{"units":"Phosphorus Runoff (lb/acre/year)","units_alternate":"Soil Erosion (tons of soil/year","type":"ero"}
        },
        'runoff':{
            "runoff":{"units":"Runoff (in)","units_alternate":"Runoff (in)","type":"Runoff"},
            "runoff_curve_number":{"units":"Curve Number","units_alternate":"Curve Number","type":"Curve Number"}
        },
        'bio':{
            "honey_bee_toxicity":{"units":"Insecticide Index","units_alternate":"Insecticide Index","type":"insect"}
        }
    }

    return_data = []
    cur.execute('SELECT * from field_model_results '
                'where field_id = %s and scenario_id = %s and farm_id = %s',
                [field_id, scenario_id, farm_id])
    result = cur.fetchone()
    column_names = [desc[0] for desc in cur.description]
    print(column_names)
    print(result)
    for model in model_types:
        if model == request.POST.get('model_parameters[model_type]'):
            for col in model_types[model]:
                if col == "runoff":
                    sum = []
                    for run_col in runoff_col:
                        col_index = column_names.index(run_col)
                        sum.append(result[col_index])
                else:
                    col_index = column_names.index(col)
                    sum = result[col_index]
                    print(sum)
                if sum is None:
                    continue
                # if type(sum) is not list:
                #     sum = round(sum, 2)
                col_index = column_names.index("area")
                area = result[col_index]
                col_index = column_names.index("cell_count")
                count = result[col_index]
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
                    "units": model_types[model][col]["units"],
                    "units_alternate": model_types[model][col]["units_alternate"],
                    # overall model type crop, ploss, bio, runoff
                    "model_type": model,
                    # specific model for runs with multiple models like corn silage
                    "value_type": model_types[model][col]["type"],
                    "f_name": f_name,
                    "scen": scen,
                    # "avg": round(avg, 2),
                    "area": area,
                    "counted_cells": count,
                    "sum_cells": sum,
                    "scen_id": scenario_id,
                    "field_id": field_id
                }
                print(data)
                return_data.append(data)
        cur.close()
        conn.close()
    return return_data
# get_values_db(1, 40, 1, "request")