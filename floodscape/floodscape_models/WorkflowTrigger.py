import subprocess
import os
import time
import floodscape.floodscape_models.cn_adjustments as cn_adjust
from floodscape.floodscape_models.dss_output import DSSOutput
import floodscape.floodscape_models.CompiledDataToJSON as compile_data

import floodscape.floodscape_models.WFK_cn_adjustments as wfk_cn_adjust
from floodscape.floodscape_models.WFK_dss_output import WFKDSSOutput
import floodscape.floodscape_models.WFK_CompiledDataToJSON as wfk_compile_data
from django.conf import settings


def hms_trigger(cn_dict_model, cn_dict_base, watershed):
    command_path = os.path.join(settings.BASE_DIR, 'floodscape', 'floodscape_models')
    debug_path = os.path.join(settings.BASE_DIR, 'floodscape', 'floodscape_models')
    if watershed == "COON CREEK Main":
        project_dir = os.path.join(settings.HMS_MODEL_PATH, "HMS_CC_Final")
        if settings.HMS_MODEL_PATH == "/tmp/floodScape":
            script_name = "cc_prod.script"
            hms_ex = "hec-hms.sh"
            command = "/tmp/hec-hms/hec-hms.sh -s /tmp/hec-hms/test.script"
        else:
            hms_ex = "hec-hms.exe"
            script_name = "cc.script"
            command = "& 'C:\\Program Files\HEC\HEC-HMS\\4.9\\HEC-HMS.exe' - s test.script"
        # command_path = os.path.join(command_path, script_name)

        # command_path = "test.script"
        # command = hms_ex + " -s " + command_path
        # cn_adjust.prepare_model_runs(project_dir, cn_dict_model, cn_dict_base)

    elif watershed == "West Fork Kickapoo Main":
        project_dir = os.path.join(settings.HMS_MODEL_PATH, "HMS_WFK_Final")
        if settings.HMS_MODEL_PATH == "/tmp/floodScape":
            script_name = "wf_prod.script"
        else:
            script_name = "wf.script"
        command_path = os.path.join(command_path, script_name)
        command = "hec-hms.exe -s " + command_path
        wfk_cn_adjust.prepare_model_runs(project_dir, cn_dict_model, cn_dict_base)
    else:
        raise ValueError("watershed region is not correct")

    # hms_exe = settings.HMS_PATH
    # print("hms model directory", project_dir)
    # print("current dir", os.getcwd())
    # cur_dir = os.getcwd()
    # os.chdir(hms_exe)
    # print("current dir", os.getcwd())
    # # List all files in the directory
    # files = os.listdir(os.getcwd())
    # print(script_name in files)
    #
    # # Print each file name
    # for file in files:
    #     print("   ", file,flush=True)
    print("console command", command,flush=True)
    # print("current dir", os.getcwd())
    # command = "hec-hms.exe -s C://Users/mmbay/Work/GrazeScape/floodscape/floodscape_models/test.script"
    # Run the command and capture the output-
    try:
        result = subprocess.run(command, capture_output=True, text=True, check=True)
        # output = subprocess.check_output(command, shell=True, universal_newlines=True, stderr=subprocess.STDOUT)

        print("HEC-HMS execution successful.")
        print("Output:")
        # print(result.stdout)
        # print(output)
    except subprocess.CalledProcessError as e:
        print(f"HEC-HMS execution failed with error: {e}")
        print("Error output:")
        print(e.stderr)
        # os.chdir(cur_dir)

    if watershed == "COON CREEK Main":
        output = DSSOutput(project_dir)
        output.run()
        model_file_path = compile_data.compile_data_to_json(project_dir)
        base_file_path = os.path.join(project_dir, "BaseLineStorms","CompiledRiverStationData_Base.json")
    elif watershed == "West Fork Kickapoo Main":
        # output = WFKDSSOutput(project_dir)
        # output.run()
        model_file_path = wfk_compile_data.compile_data_to_json(project_dir)
        base_file_path = os.path.join(project_dir, "BaseLineStorms","CompiledRiverStationData_Base.json")
    # os.chdir(cur_dir)
    return model_file_path, base_file_path

