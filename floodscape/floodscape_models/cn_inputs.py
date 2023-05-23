import re
import os


# usage: manipulate and output CN values from CC or WFK, from a baseline of current conditions. To be applied in
# XX_cn_adjustments.py enter subbasins as strings and updated CN values as floats cn_inputs.CN_Inputs(
# 'XX').replaceCN('reach',float) replaces desired CN, does not output anything or cn_inputs.CN_Inputs(
# 'XX').get_basin_CN_input() outputs new basin:CN dictionary


class CN_Inputs:
    def __init__(self, watershed, project_dir):
        self.watershed = watershed
        # CC
        # grab CNs from No Dams basin file
        self.basin_file_path_cc = os.path.join(project_dir, "Original_BasinFile", "Coon_Creek___No_Dams.basin")
        self.basin_file_path_wfk = os.path.join(project_dir, "Original_BasinFile", "West_Fork_Kickapoo___No_Dams.basin")
        self.CC_basin_CN_input = {}
        self.WFK_basin_CN_input = {}

    def reset(self):
        if self.watershed == 'CC':
            # CC
            with open(self.basin_file_path_cc, 'r') as f:
                fdata = f.read()
            subbasins_no_dams = re.findall(r"Subbasin: (.*)", fdata)
            cn_no_dams = re.findall(r"Curve Number: (\d\d.\d\d*)", fdata)  # list of strings
            cn_no_dams = [float(x) for x in cn_no_dams]
            self.CC_basin_CN_input = {}
            for basin in range(len(subbasins_no_dams)):
                self.CC_basin_CN_input[f'{subbasins_no_dams[basin]}'] = cn_no_dams[basin]

        elif self.watershed == 'WFK':
            # WFK
            with open(self.basin_file_path_wfk, 'r') as f:
                fdata = f.read()
            subbasins_no_dams = re.findall(r"Subbasin: (.*)", fdata)
            cn_no_dams = re.findall(r"Curve Number: (\d\d.\d\d*)", fdata)  # list of strings
            cn_no_dams = [float(x) for x in cn_no_dams]
            self.WFK_basin_CN_input = {}
            for basin in range(len(subbasins_no_dams)):
                self.WFK_basin_CN_input[f'{subbasins_no_dams[basin]}'] = cn_no_dams[basin]

    def replaceCN(self, basin, newCN):
        # print("replacing cn")
        if self.watershed == 'CC':
            self.CC_basin_CN_input[basin] = newCN
        elif self.watershed == 'WFK':
            self.WFK_basin_CN_input[basin] = newCN

    def get_basin_CN_input(self):
        if self.watershed == 'CC':
            return self.CC_basin_CN_input
        elif self.watershed == 'WFK':
            return self.WFK_basin_CN_input
