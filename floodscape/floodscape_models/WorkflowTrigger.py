import subprocess
import os
import time
import floodscape.floodscape_models.cn_adjustments as cn_adjust
from floodscape.floodscape_models.dss_output import DSSOutput
import floodscape.floodscape_models.CompiledDataToJSON as compile_data
from django.conf import settings


def hms_trigger(cn_dict):
    # utility: trigger full workflow, one-off
    # in_dir = os.path.join(settings.BASE_DIR, 'floodscape', 'data_files',
                               # 'raster_inputs', self.file_name)
    # project_dir = os.path.join(os.getcwd(), "HMS_CC_FINAL")
    project_dir = settings.HMS_MODEL_PATH
    # hms_exe = r"C://Program Files/HEC/HEC-HMS/4.9"
    # hms_exe = r"C://Program Files\HEC\HEC-HMS\4.9"
    hms_exe = settings.HMS_PATH
    print("hms model directory", project_dir)

    # STEP1: adjust CN and lag values in HMS .basin file
    # list_files = subprocess.run("python CC_cn_adjustments.py", cwd=r"C:\Users\paige\OneDrive\Documents\HMS_CC_Final")
    list_files = cn_adjust.prepare_model_runs(project_dir, cn_dict)
    # # time.sleep(2)
    # print("The exit code to run STEP1 was %d" % list_files.returncode)

    # if list_files == 0:
        # STEP2: run all storm scenarios
        # must cd to installation folder of HEC
        # t = r"C:\Program Files\HEC\HEC-HMS\4.6"
    # script_file = os.path.join(os.getcwd(), "CC_HMSRun.script")
    # script_file = os.path.join(os.getcwd(), "test.script")


    # script_file = os.path.join(settings.BASE_DIR, 'floodscape', "floodscape_models", "test.script")
    # os.chdir(hms_exe)
    # print(script_file)
    # list_files = subprocess.run(
    #     ["hec-hms.exe", "-s", script_file],
    #     executable=os.path.join(hms_exe, "hec-hms.exe"))
    #
    # output = DSSOutput()
    # output.run()
    # compile_data.compile_data_to_json()



