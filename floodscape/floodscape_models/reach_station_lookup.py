import pandas as pd
import numpy as np
import sys
import fileinput
import textwrap
import re
import csv
from django.conf import settings
import os


# usage: reach_station_lookup.Watershed('XX').get_reach(XXXXX.XX) to return HMS reach corresponding to entered key
# RAS station or reach_station_lookup.Watershed('XX').get_key_station('reach') to return key RAS station
# corresponding to entered HMS reach or reach_station_lookup.Watershed('XX').get_station('reach') to return list of
# all RAS stations corresponding to entered HMS reach

class Watershed:
    def __init__(self, watershed):
        self.watershed = watershed
        self.reach = None
        self.station = None
        self.project_dir = settings.HMS_MODEL_PATH
        self.CC_reach_station_lookup = {}
        self.CC_HMSreach_to_RASstations = {}

    def reach_lookup(self):
        # HMS reach to key RAS station dictionary
        if self.watershed == "CC":
            self.project_dir = os.path.join(settings.HMS_MODEL_PATH, "HMS_CC_Final")
            file_path = os.path.join(self.project_dir, "HMS_RAS_NetworkCorrelation_CC_08232022.csv")
            with open(file_path,
                      'r') as f:
                fdata = f.read()
            hms_reach = re.findall(r"\n.*?,.*?,.*?,.*?(.*?)\,", fdata)
            ras_station = re.findall(r"\n.*?,.*?,.*?,.*?,.*?(.*?)\,", fdata)
            # ras_station = [float(x) for x in ras_station] #with the implementation of a lookup tool for all minor stations,
            # some of which include a *, stations must now be strings

            for reach in range(len(hms_reach)):
                self.CC_reach_station_lookup[f'{hms_reach[reach]}'] = ras_station[reach]



            # HMS reach to all corresponding RAS reaches dictionary development crawl row by row, setting first element (HMS
            # reach) as key, following elements (all corresponding RAS reaches) as values CC
            self.CC_HMSreach_to_RASstations = {}
            file_path = os.path.join(self.project_dir, "CC_KeyStation_MinorStation_230119.csv")
            with open(file_path) as file_obj:
                heading = next(file_obj)
                reader_obj = csv.reader(file_obj)
                for column in reader_obj:
                    self.CC_HMSreach_to_RASstations[column[0]] = column[1:]

            # algorithm for removing blanks inspired by: https://www.geeksforgeeks.org/python-remove-empty-strings-from-list-of
            # -strings/
            for key in self.CC_HMSreach_to_RASstations:
                while ('' in self.CC_HMSreach_to_RASstations[key]):
                    self.CC_HMSreach_to_RASstations[key].remove('')

        # WFK
        elif self.watershed == "WFK":
            self.project_dir = os.path.join(settings.HMS_MODEL_PATH, "HMS_WFK_Final")
            file_path = os.path.join(self.project_dir, "HMS_RAS_NetworkCorrelation_WFK_090722.csv")
            with open(file_path,
                      'r') as f:
                fdata = f.read()
            hms_reach = re.findall(r"\n.*?,.*?,.*?,.*?,.*?(.*?)\,", fdata)
            ras_station = re.findall(r"\n.*?,.*?,.*?,.*?,.*?,.*?(.*?)\,", fdata)
            # ras_station = [float(x) for x in ras_station]
            self.WFK_reach_station_lookup = {}
            for reach in range(len(hms_reach)):
                self.WFK_reach_station_lookup[f'{hms_reach[reach]}'] = ras_station[reach]
            self.WFK_HMSreach_to_RASstations = {}
            file_path = os.path.join(self.project_dir, "WFK_KeyStation_MinorStation_230119.csv")

            with open(file_path) as file_obj:
                heading = next(file_obj)
                reader_obj = csv.reader(file_obj)
                for column in reader_obj:
                    self.WFK_HMSreach_to_RASstations[column[0]] = column[1:]

            # algorithm for removing blanks inspired by: https://www.geeksforgeeks.org/python-remove-empty-strings-from-list-of
            # -strings/
            for key in self.WFK_HMSreach_to_RASstations:
                while '' in self.WFK_HMSreach_to_RASstations[key]:
                    self.WFK_HMSreach_to_RASstations[key].remove('')
        else:
            raise ValueError("wrong watershed")

    def get_key_station(self, reach):
        self.reach = reach
        if self.watershed == 'CC':
            return self.CC_reach_station_lookup[self.reach]
        elif self.watershed == 'WFK':
            return self.WFK_reach_station_lookup[self.reach]

    def get_station(self, reach):  # returns list of all RAS stations corresponding to entered HMS reach
        self.reach = reach
        if self.watershed == 'CC':
            return self.CC_HMSreach_to_RASstations[self.reach]
        elif self.watershed == 'WFK':
            return self.WFK_HMSreach_to_RASstations[self.reach]

    def get_reach(self, station):
        self.station = station
        # print("In get reach")
        # print(station)
        self.station = str(self.station)
        # print(self.CC_reach_station_lookup)
        if self.watershed == 'CC':
            # inspired by: https://www.geeksforgeeks.org/python-get-key-from-value-in-dictionary/
            return list(self.CC_reach_station_lookup.keys())[
                list(self.CC_reach_station_lookup.values()).index(self.station)]
        elif self.watershed == 'WFK':
            return list(self.WFK_reach_station_lookup.keys())[
                list(self.WFK_reach_station_lookup.values()).index(self.station)]
