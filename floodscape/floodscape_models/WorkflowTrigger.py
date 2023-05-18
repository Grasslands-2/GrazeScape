import subprocess
import os
import time
import floodscape.floodscape_models.CC_cn_adjustments as cn_adjust
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
    script_file = os.path.join(settings.BASE_DIR, 'floodscape', "floodscape_models", "test.script")
    os.chdir(hms_exe)
    print(script_file)
    # list_files = subprocess.run(
    #     ["hec-hms.exe", "-s", script_file],
    #     executable=os.path.join(hms_exe, "hec-hms.exe"))
    list_files = subprocess.run(["hec-hms.exe", "-s", script_file],stdout=subprocess.PIPE, executable=os.path.join(hms_exe, "hec-hms.exe"))
    print(list_files)
    print(list_files.stdout.decode('utf-8'))
    print(dir(list_files))
    print("The exit code to run STEP2 was %d" % list_files.returncode)

    # time.sleep(2)
    # if list_files.returncode == 0:
    #     # STEP3: extract each HMS reach time series data from output .dss file, compile to .json file
    #     list_files = subprocess.run("python CC_dss_output.py", cwd=r"C:\Users\paige\OneDrive\Documents\HMS_CC_Final")
    #     print("The exit code to run STEP3 was %d" % list_files.returncode)
    #
    #     time.sleep(2)
    #     if list_files.returncode == 0:
    #         # STEP4: compile time series, peak Q, peak WSE data to JSON file
    #         list_files = subprocess.run("python CC_CompiledDataToJSON.py",
    #                                     cwd=r"C:\Users\paige\OneDrive\Documents\HMS_CC_Final")
    #         print("The exit code to run STEP4 was %d" % list_files.returncode)








# Define the HEC-HMS executable path and input file path
# hechms_path = r'C:\Program Files (x86)\HEC\HEC-HMS\4.7.1\HEC-HMS.exe'
# input_file = r'C:\HEC-HMS\Input\my_input_file.hms'
#
# # Define the command to run HEC-HMS with the input file
# cmd = [hechms_path, input_file]
#
# # Create a subprocess and run the command
# p = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
#
# # Wait for the command to finish and get its output and error
# output, error = p.communicate()
#
# # Print the output and error
# print(output.decode())
# print(error.decode())