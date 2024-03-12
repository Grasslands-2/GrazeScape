import os
from pydsstools.heclib.dss.HecDss import Open
import json
from datetime import datetime


class WFKDSSOutput:
    def __init__(self, project_dir):
        self.reaches = ['HC A - HC B',
                        'HC B- HC C',
                        'HC C - JUNCTION',
                        'HC D - JUNCTION',
                        'HC C&D - HC E',
                        'WFK 17 - JUNCTION',
                        'B A - JUNCTION',
                        'B A & WFK 17 - B B',
                        'B B - B C',
                        'WFK 4 - JUNCTION',
                        'WFK 5 - JUNCTION',
                        'WFK 12 - KC WFK L',
                        'WFK 3 - KC WFK F',
                        'KLINKNER - JUNCTION',
                        'MLSNA - JUNCTION',
                        'JUNCTION - KC WFK A',
                        'KC WFK A - KC WFK B',
                        'WFK 1 - JUNCTION',
                        'KC WFK C - JUNCTION',
                        'JUNCTION - KC WFK D',
                        'KC WFK D - JUNCTION',
                        'KC WFK B - JUNCTION',
                        'JUNCTION - KC WFK E',
                        'WFK16 - KC WFK E',
                        'KC WFK E - JUNCTION',
                        'KC WFK F - JUNCTION',
                        'JUNCTION - JUNCTION',
                        'JUNCTION - KC WFK H',
                        'KC WFK H & I - JUNCTION',
                        'KC WFK L - JUNCTION',
                        'JUNCTION- JUNCTION (KCWFK K)',
                        'KC WFK J - JUNCTION',
                        'JUNCTION 2- JUNCTION 3',
                        'KC WFK M - JUNCTION',
                        'JUNCTION - KC WFK K',
                        'JUNCTION - SB',
                        'SEAS & KC WFK - WFK B',
                        'WFK A - JUNCTION',
                        'WFK B JUNCTIONS',
                        'WFK D - JUNCTION',
                        'WFK B - JUNCTION',
                        'WFK C - JUNCTION',
                        'JUNCTION - WFK E',
                        'WFK F - JUNCTION',
                        'JUNCTION - WFK G',
                        'B C - B D',
                        'JUNCTION - JUNCTION - WFK H',
                        'WFK I - JUNCTION',
                        'JUNCTION - WFK H',
                        'WFK H - JUNCTION',
                        'HC E  - JUNCTION',
                        'JUNCTION - OUTFLOW']
        self.events = ["2", "5", "10", "25", "50", "200", "500"]  # 2yr-25yr not currently working for WFK
        # self.events = ["50","100", "200", "500"]
        self.project_dir = project_dir

    def out_data(self, dss_file, event):
        return_dict = {}
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
            dss_file = os.path.join(self.project_dir, "WFK_{}yrStorm".format(event), "MSE4_No_Dams.dss")
            event_dict[event] = self.out_data(dss_file, event)
        # 100 year event is named differently so just separated it out in CC, no need to do so in WFK
        dss_file = os.path.join(self.project_dir, "West_Fork_Kickapoo_100yrSto", "MSE4_No_Dams.dss")
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
