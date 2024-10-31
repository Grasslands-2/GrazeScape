import os
from pydsstools.heclib.dss.HecDss import Open
import json
from datetime import datetime
from django.conf import settings
from floodscape.floodscape_models.hide_print import HidePrint


class DSSOutput:
    def __init__(self, project_dir):
        self.reaches = ['MCC A - MCC B',
                        'MCC B MCC C',
                        'MCC C - MCC D',
                        'MCC D - MCC E',
                        'CC 17 - JUNCTION',
                        'CC16 - JUNCTION',
                        'TC B REACH 1',
                        'CC15 - JUNCTION',
                        'TC B REACH 2',
                        'CC 41 - JUNCTION',
                        'TC B REACH 3',
                        'CC 14 - JUNCTION',
                        'TC B REACH 4',
                        'CC23 - JUNCTION',
                        'CC24 - JUNCTION',
                        'JUNCTION - JUNCTION TC A',
                        'CC25 - JUNCTION',
                        'JUNCTION - TC A',
                        'CC21 - TC A',
                        'TC A - TC C',
                        'TC B - D',
                        'JUNCTION - TC F',
                        'CC53 - TC E',
                        'JUNCTION - TC G',
                        'CC31 - CC29',
                        'CC29 - UCC A',
                        'CC33 - UCC A',
                        'UCC A - B',
                        'UCC B - C',
                        'UCC C - JUNCTION',
                        'CC35 - JUNCTION',
                        'JUNCTION - UCC D',
                        'UCC & TC - JUNCTION',
                        'MCC H REACH 1',
                        'MCC E - MCC F',
                        'MCC H REACH 2',
                        'MCC H REACH 3',
                        'MCC I & H - MCC K',
                        'MCC O UPPER',
                        'Junction - MCC O',
                        'MCC N - MCC P',
                        'JUNCTION - LCC B',
                        'LCC B - D',
                        'LCC C - JUNCTION',
                        'JUNCTION - LCC F',
                        'JUNCTION - LCC G',
                        'LCC G - LCC H',
                        'LCC H - JUNCTION',
                        'Lower CC I INTO J',
                        'JUNCTION - LCC J',
                        'LCC A - LCC C']
        self.events = ["2", "5", "10", "25", "50", "200", "500"]
        self.project_dir = project_dir

    def out_data(self, dss_file, event):
        return_dict = {}
        with HidePrint():
            with Open(dss_file, event) as fid:
                for reach in self.reaches:
                    pathname_pattern = "//{}/FLOW/*/5Minute/RUN:MSE4 NO DAMS/".format(reach)
                    ts = fid.read_ts(pathname_pattern)
                    times = ts.times
                    # convert numpy array to list so we can serialize it
                    values = ts.values.tolist()
                    # return_dict[reach] = {"time": times, "values": values, "max_q": max(values)} #Matthew's work
                    return_dict[reach] = {"q": values, "max_q": max(values)}  # Paige's rework
        return return_dict

    def run(self):
        event_dict = {}
        for event in self.events:
            dss_file = os.path.join(self.project_dir, "CC_{}yrStorm".format(event), "MSE4_No_Dams.dss")
            event_dict[event] = self.out_data(dss_file, event)
        # 100 year event is named differently so just separated it out
        dss_file = os.path.join(self.project_dir, "CoonCreek_100yrStorm", "MSE4_No_Dams.dss")
        event = "100"
        event_dict[event] = self.out_data(dss_file, event)

        # Serializing json
        json_object = json.dumps(event_dict, indent=4)
        date = datetime.today()
        date = date.strftime("%d%m%Y_%H%M%S")

        # Writing to json file
        # with open(os.path.join("CompiledDataFromDSS_{}.json".format(date)), "w") as outfile:

        with open(os.path.join(self.project_dir, "CompiledDataFromDSS_{}.json".format('overwrite')), "w") as outfile:
            outfile.write(json_object)


if __name__ == "__main__":
    DSSOutput().run()
