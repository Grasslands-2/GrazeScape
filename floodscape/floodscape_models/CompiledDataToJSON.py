# mission rework step 4 (CompiledDataToJSON.py)
import numpy as np
import re
from collections import OrderedDict
from datetime import datetime
from floodscape.floodscape_models.reach_station_lookup import Watershed
import json
from django.conf import settings
import os
import csv


# usage: pull together all pertinent data from .dss files (time series, Qmax, calculated WSE) with the support of
# Qmax~WSE correlations compiled from RAS, and HMS reach~RAS station correlations compiled manually

# SET UP DICTIONARY OF ARRAYS HOLDING QMAX, WSE, SLOPE & INTERCEPT /STATION /STORM

# bring in compiled .csv (UTF-8) file of Peak Flow ~ WSE correlations, exported from RAS summary table and keep only
# reach, river station, profile, Q Total and W.S. Elev columns;
# .csv should have no extra spaces, keep headings

def compile_data_to_json(project_dir):
    # project_dir = settings.HMS_MODEL_PATH
    file_path = os.path.join(project_dir, "PeakFlow_WSE_Correlations_RiverStations_CC_081722.csv")
    with open(file_path,
              'r') as f:
        fdata = f.read()
    # reaches = re.findall(r"\n(.*?)\,", fdata)
    # reaches = list(OrderedDict.fromkeys(reaches))  # to remove duplicates and maintain order
    stations = re.findall(r"\n.*?,(.*?),.*?,.*?,\d*.\d*", fdata)  # regex structured this way to toss the culvert
    stations = list(OrderedDict.fromkeys(stations))  # to remove duplicates and maintain order
    q_max = re.findall(r"\n.*?,.*?,.*?,(\d*.\d*)\,", fdata)
    q_max = [float(x) for x in q_max]
    wse = re.findall(r"\n.*?,.*?,.*?,.*?,(\d*.\d*)", fdata)
    wse = [float(x) for x in wse]
    # print("stations",stations)
    # print("q_max", q_max)
    # print("wse", wse)

    # define slope and intercept functions
    def slope(x0, x1, y0, y1):
        return ((y1 - y0) / (x1 - x0)) if x1 - x0 else None

    def intercept(x0, x1, y0, y1):
        return y0 - (((y1 - y0) / (x1 - x0)) * x0) if x1 - x0 else None

    # compile info for each river station
    qmax_wse = {}
    i = 0
    for station in range(len(stations)):
        qmax_wse[f'{stations[station]}'] = np.array(([q_max[i], wse[i], 99, 999],
                                                     [q_max[i + 1], wse[i + 1],
                                                      slope(q_max[i], q_max[i + 1], wse[i], wse[i + 1]),
                                                      intercept(q_max[i], q_max[i + 1], wse[i], wse[i + 1])],
                                                     [q_max[i + 2], wse[i + 2],
                                                      slope(q_max[i + 1], q_max[i + 2], wse[i + 1], wse[i + 2]),
                                                      intercept(q_max[i + 1], q_max[i + 2], wse[i + 1], wse[i + 2])],
                                                     [q_max[i + 3], wse[i + 3],
                                                      slope(q_max[i + 2], q_max[i + 3], wse[i + 2], wse[i + 3]),
                                                      intercept(q_max[i + 2], q_max[i + 3], wse[i + 2], wse[i + 3])],
                                                     [q_max[i + 4], wse[i + 4],
                                                      slope(q_max[i + 3], q_max[i + 4], wse[i + 3], wse[i + 4]),
                                                      intercept(q_max[i + 3], q_max[i + 4], wse[i + 3], wse[i + 4])],
                                                     [q_max[i + 5], wse[i + 5],
                                                      slope(q_max[i + 4], q_max[i + 5], wse[i + 4], wse[i + 5]),
                                                      intercept(q_max[i + 4], q_max[i + 5], wse[i + 4], wse[i + 5])],
                                                     [q_max[i + 6], wse[i + 6],
                                                      slope(q_max[i + 5], q_max[i + 6], wse[i + 5], wse[i + 6]),
                                                      intercept(q_max[i + 5], q_max[i + 6], wse[i + 5], wse[i + 6])],
                                                     [q_max[i + 7], wse[i + 7],
                                                      slope(q_max[i + 6], q_max[i + 7], wse[i + 6], wse[i + 7]),
                                                      intercept(q_max[i + 6], q_max[i + 7], wse[i + 6], wse[i + 7])]))
        i = i + 8

    # DEFINE HMS REACHES TO PULL TIME SERIES DATA FROM DSS VUE, DEFINE KEY RAS STATIONS TO SUPPORT LOOPS

    file_path = os.path.join(project_dir, "HMS_RAS_NetworkCorrelation_CC_08232022.csv")
    column_index = 4  # Replace with the index of your desired column (0-based index)
    float_list = []
    with open(file_path, 'r') as file:
        reader = csv.reader(file)
        headers = next(reader)  # Skip the header row

        for row in reader:
            try:
                value = float(row[column_index])
                float_list.append(value)
            except ValueError:
                # Handle non-numeric values if needed
                pass

    # print(float_list)
    # with open(file_path, 'r') as f:
    #     fdata = f.read()
    # reaches = re.findall(r"\n.*?,.*?,.*?,.*?,.*?(.*?)\,", fdata)
    # key_station = re.findall(r"\n.*?,.*?,.*?,.*?,.*?,.*?(.*?)\,", fdata)
    # for key in key_station:
    #     print("I'm a key", key)
    # key_station = [float(x) for x in key_station]
    key_station = float_list

    # KEY STATION ~ HMS REACH LOOKUP
    CC = Watershed('CC')  # usage: CC.get_reach(station) or CC.get_station('reach')
    CC.reach_lookup()
    # PULL EXPERIMENTAL DATA FROM DSS VUE; SWAP HMS REACH FOR RAS STATION IDENTIFIER
    # Opening JSON file
    file_path = os.path.join(project_dir, "CompiledDataFromDSS_overwrite.json")
    f = open(file_path)

    # returns JSON object as a dictionary
    CompiledDataFromDSS = json.load(f)
    f.close()
    CompiledDataFromDSS['5']['MCC A - MCC B']['max_q']

    # WSE CALCULATION
    # create some useful elements to make looping easier
    storms = ['2', '5', '10', '25', '50', '100', '200', '500']
    # dict_of_stations_max_names = {0:dict_of_stations_max_2yr, 1:dict_of_stations_max_5yr,2:dict_of_stations_max_10yr,
    #                              3:dict_of_stations_max_25yr,4:dict_of_stations_max_50yr,5:dict_of_stations_max_100yr,
    #                              6:dict_of_stations_max_200yr,7:dict_of_stations_max_500yr}

    calc_wse = {'2': {}, '5': {}, '10': {}, '25': {}, '50': {}, '100': {}, '200': {}, '500': {}}
    for storm in range(len(storms)):  # 8 instances
        for station in range(len(key_station)):  # 51 instances
            # print("I'm at station", station)
            reach_name = CC.get_reach(f'{key_station[station]}').upper()
            # print("reach name", reach_name)
            if reach_name == "JUNCTION - MCC O":
                reach_name = "Junction - MCC O"
            if reach_name == "LOWER CC I INTO J":
                reach_name = "Lower CC I INTO J"
            # under 2yr Qmax
            if CompiledDataFromDSS[f'{storms[storm]}'][reach_name]['max_q'] <= \
                    qmax_wse[f'{key_station[station]}'][0, 0]:
                statement = 'Warning: Max flow is under model parameters'
                calc_wse[f'{storms[storm]}'][f'{key_station[station]}'] = 99
            # between 2yr & 5yr Qmax
            if qmax_wse[f'{key_station[station]}'][0, 0] < \
                    CompiledDataFromDSS[f'{storms[storm]}'][reach_name]['max_q'] <= \
                    qmax_wse[f'{key_station[station]}'][1, 0]:
                calc_wse[f'{storms[storm]}'][f'{key_station[station]}'] = qmax_wse[f'{key_station[station]}'][1, 2] * \
                                                                          CompiledDataFromDSS[f'{storms[storm]}'][
                                                                              reach_name][
                                                                              'max_q'] + \
                                                                          qmax_wse[f'{key_station[station]}'][
                                                                              1, 3]  # y=mx+b
            # between 5yr & 10yr Qmax
            if qmax_wse[f'{key_station[station]}'][1, 0] < \
                    CompiledDataFromDSS[f'{storms[storm]}'][reach_name]['max_q'] <= \
                    qmax_wse[f'{key_station[station]}'][2, 0]:
                calc_wse[f'{storms[storm]}'][f'{key_station[station]}'] = qmax_wse[f'{key_station[station]}'][2, 2] * \
                                                                          CompiledDataFromDSS[f'{storms[storm]}'][
                                                                              reach_name][
                                                                              'max_q'] + \
                                                                          qmax_wse[f'{key_station[station]}'][
                                                                              2, 3]  # y=mx+b
            # between 10yr and 25yr Qmax
            if qmax_wse[f'{key_station[station]}'][2, 0] < \
                    CompiledDataFromDSS[f'{storms[storm]}'][reach_name]['max_q'] <= \
                    qmax_wse[f'{key_station[station]}'][3, 0]:
                calc_wse[f'{storms[storm]}'][f'{key_station[station]}'] = qmax_wse[f'{key_station[station]}'][3, 2] * \
                                                                          CompiledDataFromDSS[f'{storms[storm]}'][
                                                                              reach_name][
                                                                              'max_q'] + \
                                                                          qmax_wse[f'{key_station[station]}'][
                                                                              3, 3]  # y=mx+b
            # between 25yr and 50yr Qmax
            if qmax_wse[f'{key_station[station]}'][3, 0] < \
                    CompiledDataFromDSS[f'{storms[storm]}'][reach_name]['max_q'] <= \
                    qmax_wse[f'{key_station[station]}'][4, 0]:
                calc_wse[f'{storms[storm]}'][f'{key_station[station]}'] = qmax_wse[f'{key_station[station]}'][4, 2] * \
                                                                          CompiledDataFromDSS[f'{storms[storm]}'][
                                                                              reach_name][
                                                                              'max_q'] + \
                                                                          qmax_wse[f'{key_station[station]}'][
                                                                              4, 3]  # y=mx+b
            # between 50yr and 100yr Qmax
            if qmax_wse[f'{key_station[station]}'][4, 0] < \
                    CompiledDataFromDSS[f'{storms[storm]}'][reach_name]['max_q'] <= \
                    qmax_wse[f'{key_station[station]}'][5, 0]:
                calc_wse[f'{storms[storm]}'][f'{key_station[station]}'] = qmax_wse[f'{key_station[station]}'][5, 2] * \
                                                                          CompiledDataFromDSS[f'{storms[storm]}'][
                                                                              reach_name][
                                                                              'max_q'] + \
                                                                          qmax_wse[f'{key_station[station]}'][
                                                                              5, 3]  # y=mx+b
            # between 100yr and 200yr Qmax
            if qmax_wse[f'{key_station[station]}'][5, 0] < \
                    CompiledDataFromDSS[f'{storms[storm]}'][reach_name]['max_q'] <= \
                    qmax_wse[f'{key_station[station]}'][6, 0]:
                calc_wse[f'{storms[storm]}'][f'{key_station[station]}'] = qmax_wse[f'{key_station[station]}'][6, 2] * \
                                                                          CompiledDataFromDSS[f'{storms[storm]}'][
                                                                              reach_name][
                                                                              'max_q'] + \
                                                                          qmax_wse[f'{key_station[station]}'][
                                                                              6, 3]  # y=mx+b
            # between 200yr and 500yr Qmax
            if qmax_wse[f'{key_station[station]}'][6, 0] < \
                    CompiledDataFromDSS[f'{storms[storm]}'][reach_name]['max_q'] <= \
                    qmax_wse[f'{key_station[station]}'][7, 0]:
                calc_wse[f'{storms[storm]}'][f'{key_station[station]}'] = qmax_wse[f'{key_station[station]}'][7, 2] * \
                                                                          CompiledDataFromDSS[f'{storms[storm]}'][
                                                                              reach_name][
                                                                              'max_q'] + \
                                                                          qmax_wse[f'{key_station[station]}'][
                                                                              7, 3]  # y=mx+b
            # above 500yr Qmax
            if CompiledDataFromDSS[f'{storms[storm]}'][reach_name]['max_q'] > \
                    qmax_wse[f'{key_station[station]}'][7, 0]:
                statement = 'Warning: Max flow is above model parameters; 200yr to 500yr rating curve applied to flow'
                calc_wse[f'{storms[storm]}'][f'{key_station[station]}'] = qmax_wse[f'{key_station[station]}'][7, 2] * \
                                                                          CompiledDataFromDSS[f'{storms[storm]}'][
                                                                              reach_name][
                                                                              'max_q'] + \
                                                                          qmax_wse[f'{key_station[station]}'][
                                                                              7, 3]  # y=mx+b

    # COMPILE ALL INFO TO JSON
    # set up dictionary to be populated
    CompiledRiverStationData = {'2yr': {'19036.03': {},
                                        '8797.13': {},
                                        '7622.34': {},
                                        '19040.92': {},
                                        '9494.62': {},
                                        '590.65': {},
                                        '4466.19': {},
                                        '13430.16': {},
                                        '4359.26': {},
                                        '2641.32': {},
                                        '4527.34': {},
                                        '1232.49': {},
                                        '4267.35': {},
                                        '11625.38': {},
                                        '12950.3': {},
                                        '3627.17': {},
                                        '2790.94': {},
                                        '1662.23': {},
                                        '4921.17': {},
                                        '951.5': {},
                                        '3418.18': {},
                                        '5245.34': {},
                                        '2493.1': {},
                                        '15665.35': {},
                                        '13560.94': {},
                                        '8087.76': {},
                                        '12141.36': {},
                                        '15400.45': {},
                                        '12796.04': {},
                                        '10042.47': {},
                                        '38709.59': {},
                                        '30033.24': {},
                                        '25620.54': {},
                                        '19971.03': {},
                                        '15297.72': {},
                                        '38559.55': {},
                                        '34219.34': {},
                                        '30304.08': {},
                                        '19464.66': {},
                                        '8144.88': {},
                                        '16229.51': {},
                                        '23137.98': {},
                                        '16878.2': {},
                                        '7795.3': {},
                                        '682.18': {},
                                        '48139.2': {},
                                        '27159.3': {},
                                        '19607.41': {},
                                        '6114.88': {},
                                        '578.15': {},
                                        '10184.34': {}},
                                '5yr': {'19036.03': {},
                                        '8797.13': {},
                                        '7622.34': {},
                                        '19040.92': {},
                                        '9494.62': {},
                                        '590.65': {},
                                        '4466.19': {},
                                        '13430.16': {},
                                        '4359.26': {},
                                        '2641.32': {},
                                        '4527.34': {},
                                        '1232.49': {},
                                        '4267.35': {},
                                        '11625.38': {},
                                        '12950.3': {},
                                        '3627.17': {},
                                        '2790.94': {},
                                        '1662.23': {},
                                        '4921.17': {},
                                        '951.5': {},
                                        '3418.18': {},
                                        '5245.34': {},
                                        '2493.1': {},
                                        '15665.35': {},
                                        '13560.94': {},
                                        '8087.76': {},
                                        '12141.36': {},
                                        '15400.45': {},
                                        '12796.04': {},
                                        '10042.47': {},
                                        '38709.59': {},
                                        '30033.24': {},
                                        '25620.54': {},
                                        '19971.03': {},
                                        '15297.72': {},
                                        '38559.55': {},
                                        '34219.34': {},
                                        '30304.08': {},
                                        '19464.66': {},
                                        '8144.88': {},
                                        '16229.51': {},
                                        '23137.98': {},
                                        '16878.2': {},
                                        '7795.3': {},
                                        '682.18': {},
                                        '48139.2': {},
                                        '27159.3': {},
                                        '19607.41': {},
                                        '6114.88': {},
                                        '578.15': {},
                                        '10184.34': {}},
                                '10yr': {'19036.03': {},
                                         '8797.13': {},
                                         '7622.34': {},
                                         '19040.92': {},
                                         '9494.62': {},
                                         '590.65': {},
                                         '4466.19': {},
                                         '13430.16': {},
                                         '4359.26': {},
                                         '2641.32': {},
                                         '4527.34': {},
                                         '1232.49': {},
                                         '4267.35': {},
                                         '11625.38': {},
                                         '12950.3': {},
                                         '3627.17': {},
                                         '2790.94': {},
                                         '1662.23': {},
                                         '4921.17': {},
                                         '951.5': {},
                                         '3418.18': {},
                                         '5245.34': {},
                                         '2493.1': {},
                                         '15665.35': {},
                                         '13560.94': {},
                                         '8087.76': {},
                                         '12141.36': {},
                                         '15400.45': {},
                                         '12796.04': {},
                                         '10042.47': {},
                                         '38709.59': {},
                                         '30033.24': {},
                                         '25620.54': {},
                                         '19971.03': {},
                                         '15297.72': {},
                                         '38559.55': {},
                                         '34219.34': {},
                                         '30304.08': {},
                                         '19464.66': {},
                                         '8144.88': {},
                                         '16229.51': {},
                                         '23137.98': {},
                                         '16878.2': {},
                                         '7795.3': {},
                                         '682.18': {},
                                         '48139.2': {},
                                         '27159.3': {},
                                         '19607.41': {},
                                         '6114.88': {},
                                         '578.15': {},
                                         '10184.34': {}},
                                '25yr': {'19036.03': {},
                                         '8797.13': {},
                                         '7622.34': {},
                                         '19040.92': {},
                                         '9494.62': {},
                                         '590.65': {},
                                         '4466.19': {},
                                         '13430.16': {},
                                         '4359.26': {},
                                         '2641.32': {},
                                         '4527.34': {},
                                         '1232.49': {},
                                         '4267.35': {},
                                         '11625.38': {},
                                         '12950.3': {},
                                         '3627.17': {},
                                         '2790.94': {},
                                         '1662.23': {},
                                         '4921.17': {},
                                         '951.5': {},
                                         '3418.18': {},
                                         '5245.34': {},
                                         '2493.1': {},
                                         '15665.35': {},
                                         '13560.94': {},
                                         '8087.76': {},
                                         '12141.36': {},
                                         '15400.45': {},
                                         '12796.04': {},
                                         '10042.47': {},
                                         '38709.59': {},
                                         '30033.24': {},
                                         '25620.54': {},
                                         '19971.03': {},
                                         '15297.72': {},
                                         '38559.55': {},
                                         '34219.34': {},
                                         '30304.08': {},
                                         '19464.66': {},
                                         '8144.88': {},
                                         '16229.51': {},
                                         '23137.98': {},
                                         '16878.2': {},
                                         '7795.3': {},
                                         '682.18': {},
                                         '48139.2': {},
                                         '27159.3': {},
                                         '19607.41': {},
                                         '6114.88': {},
                                         '578.15': {},
                                         '10184.34': {}},
                                '50yr': {'19036.03': {},
                                         '8797.13': {},
                                         '7622.34': {},
                                         '19040.92': {},
                                         '9494.62': {},
                                         '590.65': {},
                                         '4466.19': {},
                                         '13430.16': {},
                                         '4359.26': {},
                                         '2641.32': {},
                                         '4527.34': {},
                                         '1232.49': {},
                                         '4267.35': {},
                                         '11625.38': {},
                                         '12950.3': {},
                                         '3627.17': {},
                                         '2790.94': {},
                                         '1662.23': {},
                                         '4921.17': {},
                                         '951.5': {},
                                         '3418.18': {},
                                         '5245.34': {},
                                         '2493.1': {},
                                         '15665.35': {},
                                         '13560.94': {},
                                         '8087.76': {},
                                         '12141.36': {},
                                         '15400.45': {},
                                         '12796.04': {},
                                         '10042.47': {},
                                         '38709.59': {},
                                         '30033.24': {},
                                         '25620.54': {},
                                         '19971.03': {},
                                         '15297.72': {},
                                         '38559.55': {},
                                         '34219.34': {},
                                         '30304.08': {},
                                         '19464.66': {},
                                         '8144.88': {},
                                         '16229.51': {},
                                         '23137.98': {},
                                         '16878.2': {},
                                         '7795.3': {},
                                         '682.18': {},
                                         '48139.2': {},
                                         '27159.3': {},
                                         '19607.41': {},
                                         '6114.88': {},
                                         '578.15': {},
                                         '10184.34': {}},
                                '100yr': {'19036.03': {},
                                          '8797.13': {},
                                          '7622.34': {},
                                          '19040.92': {},
                                          '9494.62': {},
                                          '590.65': {},
                                          '4466.19': {},
                                          '13430.16': {},
                                          '4359.26': {},
                                          '2641.32': {},
                                          '4527.34': {},
                                          '1232.49': {},
                                          '4267.35': {},
                                          '11625.38': {},
                                          '12950.3': {},
                                          '3627.17': {},
                                          '2790.94': {},
                                          '1662.23': {},
                                          '4921.17': {},
                                          '951.5': {},
                                          '3418.18': {},
                                          '5245.34': {},
                                          '2493.1': {},
                                          '15665.35': {},
                                          '13560.94': {},
                                          '8087.76': {},
                                          '12141.36': {},
                                          '15400.45': {},
                                          '12796.04': {},
                                          '10042.47': {},
                                          '38709.59': {},
                                          '30033.24': {},
                                          '25620.54': {},
                                          '19971.03': {},
                                          '15297.72': {},
                                          '38559.55': {},
                                          '34219.34': {},
                                          '30304.08': {},
                                          '19464.66': {},
                                          '8144.88': {},
                                          '16229.51': {},
                                          '23137.98': {},
                                          '16878.2': {},
                                          '7795.3': {},
                                          '682.18': {},
                                          '48139.2': {},
                                          '27159.3': {},
                                          '19607.41': {},
                                          '6114.88': {},
                                          '578.15': {},
                                          '10184.34': {}}, ''
                                                           '200yr': {'19036.03': {},
                                                                     '8797.13': {},
                                                                     '7622.34': {},
                                                                     '19040.92': {},
                                                                     '9494.62': {},
                                                                     '590.65': {},
                                                                     '4466.19': {},
                                                                     '13430.16': {},
                                                                     '4359.26': {},
                                                                     '2641.32': {},
                                                                     '4527.34': {},
                                                                     '1232.49': {},
                                                                     '4267.35': {},
                                                                     '11625.38': {},
                                                                     '12950.3': {},
                                                                     '3627.17': {},
                                                                     '2790.94': {},
                                                                     '1662.23': {},
                                                                     '4921.17': {},
                                                                     '951.5': {},
                                                                     '3418.18': {},
                                                                     '5245.34': {},
                                                                     '2493.1': {},
                                                                     '15665.35': {},
                                                                     '13560.94': {},
                                                                     '8087.76': {},
                                                                     '12141.36': {},
                                                                     '15400.45': {},
                                                                     '12796.04': {},
                                                                     '10042.47': {},
                                                                     '38709.59': {},
                                                                     '30033.24': {},
                                                                     '25620.54': {},
                                                                     '19971.03': {},
                                                                     '15297.72': {},
                                                                     '38559.55': {},
                                                                     '34219.34': {},
                                                                     '30304.08': {},
                                                                     '19464.66': {},
                                                                     '8144.88': {},
                                                                     '16229.51': {},
                                                                     '23137.98': {},
                                                                     '16878.2': {},
                                                                     '7795.3': {},
                                                                     '682.18': {},
                                                                     '48139.2': {},
                                                                     '27159.3': {},
                                                                     '19607.41': {},
                                                                     '6114.88': {},
                                                                     '578.15': {},
                                                                     '10184.34': {}}, '500yr': {'19036.03': {},
                                                                                                '8797.13': {},
                                                                                                '7622.34': {},
                                                                                                '19040.92': {},
                                                                                                '9494.62': {},
                                                                                                '590.65': {},
                                                                                                '4466.19': {},
                                                                                                '13430.16': {},
                                                                                                '4359.26': {},
                                                                                                '2641.32': {},
                                                                                                '4527.34': {},
                                                                                                '1232.49': {},
                                                                                                '4267.35': {},
                                                                                                '11625.38': {},
                                                                                                '12950.3': {},
                                                                                                '3627.17': {},
                                                                                                '2790.94': {},
                                                                                                '1662.23': {},
                                                                                                '4921.17': {},
                                                                                                '951.5': {},
                                                                                                '3418.18': {},
                                                                                                '5245.34': {},
                                                                                                '2493.1': {},
                                                                                                '15665.35': {},
                                                                                                '13560.94': {},
                                                                                                '8087.76': {},
                                                                                                '12141.36': {},
                                                                                                '15400.45': {},
                                                                                                '12796.04': {},
                                                                                                '10042.47': {},
                                                                                                '38709.59': {},
                                                                                                '30033.24': {},
                                                                                                '25620.54': {},
                                                                                                '19971.03': {},
                                                                                                '15297.72': {},
                                                                                                '38559.55': {},
                                                                                                '34219.34': {},
                                                                                                '30304.08': {},
                                                                                                '19464.66': {},
                                                                                                '8144.88': {},
                                                                                                '16229.51': {},
                                                                                                '23137.98': {},
                                                                                                '16878.2': {},
                                                                                                '7795.3': {},
                                                                                                '682.18': {},
                                                                                                '48139.2': {},
                                                                                                '27159.3': {},
                                                                                                '19607.41': {},
                                                                                                '6114.88': {},
                                                                                                '578.15': {},
                                                                                                '10184.34': {}}}
    print("comiled river station")
    print("key_station", key_station)
    for station in range(len(key_station)):  # 51 instances
        # print("station", station)
        # print("key station", key_station[station])
        reach_name = CC.get_reach(f'{key_station[station]}').upper()
        if reach_name == "JUNCTION - MCC O":
            reach_name = "Junction - MCC O"
        if reach_name == "LOWER CC I INTO J":
            reach_name = "Lower CC I INTO J"
        CompiledRiverStationData['2yr'][f'{key_station[station]}']['time series'] = \
            CompiledDataFromDSS['2'][reach_name]['q']
        CompiledRiverStationData['2yr'][f'{key_station[station]}']['Qmax'] = \
            CompiledDataFromDSS['2'][reach_name]['max_q']
        CompiledRiverStationData['2yr'][f'{key_station[station]}']['WSE'] = calc_wse['2'][f'{key_station[station]}']
        # for station in range(len(key_station)):  # 51 instances
        CompiledRiverStationData['5yr'][f'{key_station[station]}']['time series'] = \
            CompiledDataFromDSS['5'][reach_name]['q']
        CompiledRiverStationData['5yr'][f'{key_station[station]}']['Qmax'] = \
            CompiledDataFromDSS['5'][reach_name]['max_q']
        CompiledRiverStationData['5yr'][f'{key_station[station]}']['WSE'] = calc_wse['5'][f'{key_station[station]}']
        # for station in range(len(key_station)):  # 51 instances
        CompiledRiverStationData['10yr'][f'{key_station[station]}']['time series'] = \
            CompiledDataFromDSS['10'][reach_name]['q']
        CompiledRiverStationData['10yr'][f'{key_station[station]}']['Qmax'] = \
            CompiledDataFromDSS['10'][reach_name]['max_q']
        CompiledRiverStationData['10yr'][f'{key_station[station]}']['WSE'] = calc_wse['10'][f'{key_station[station]}']
        # for station in range(len(key_station)):  # 51 instances
        CompiledRiverStationData['25yr'][f'{key_station[station]}']['time series'] = \
            CompiledDataFromDSS['25'][reach_name]['q']
        CompiledRiverStationData['25yr'][f'{key_station[station]}']['Qmax'] = \
            CompiledDataFromDSS['25'][reach_name]['max_q']
        CompiledRiverStationData['25yr'][f'{key_station[station]}']['WSE'] = calc_wse['25'][f'{key_station[station]}']
        # for station in range(len(key_station)):  # 51 instances
        CompiledRiverStationData['50yr'][f'{key_station[station]}']['time series'] = \
            CompiledDataFromDSS['50'][reach_name]['q']
        CompiledRiverStationData['50yr'][f'{key_station[station]}']['Qmax'] = \
            CompiledDataFromDSS['50'][reach_name]['max_q']
        CompiledRiverStationData['50yr'][f'{key_station[station]}']['WSE'] = calc_wse['50'][f'{key_station[station]}']
        # for station in range(len(key_station)):  # 51 instances
        CompiledRiverStationData['100yr'][f'{key_station[station]}']['time series'] = \
            CompiledDataFromDSS['100'][reach_name]['q']
        CompiledRiverStationData['100yr'][f'{key_station[station]}']['Qmax'] = \
            CompiledDataFromDSS['100'][reach_name]['max_q']
        CompiledRiverStationData['100yr'][f'{key_station[station]}']['WSE'] = calc_wse['100'][f'{key_station[station]}']
        # for station in range(len(key_station)):  # 51 instances
        CompiledRiverStationData['200yr'][f'{key_station[station]}']['time series'] = \
            CompiledDataFromDSS['200'][reach_name]['q']
        CompiledRiverStationData['200yr'][f'{key_station[station]}']['Qmax'] = \
            CompiledDataFromDSS['200'][reach_name]['max_q']
        CompiledRiverStationData['200yr'][f'{key_station[station]}']['WSE'] = calc_wse['200'][f'{key_station[station]}']
        # for station in range(len(key_station)):  # 51 instances
        CompiledRiverStationData['500yr'][f'{key_station[station]}']['time series'] = \
            CompiledDataFromDSS['500'][reach_name]['q']
        CompiledRiverStationData['500yr'][f'{key_station[station]}']['Qmax'] = \
            CompiledDataFromDSS['500'][reach_name]['max_q']
        CompiledRiverStationData['500yr'][f'{key_station[station]}']['WSE'] = calc_wse['500'][f'{key_station[station]}']

    # Serializing json
    json_object = json.dumps(CompiledRiverStationData, indent=4)
    date = datetime.today()
    date = date.strftime("%d%m%Y_%H%M%S")
    file_path = os.path.join(project_dir, "CompiledRiverStationData_" + date + ".json")

    # Writing to sample.json
    with open(file_path, "w") as outfile:
        outfile.write(json_object)
    return file_path