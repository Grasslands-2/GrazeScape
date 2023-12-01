import multiprocessing
import pickle
from grazescape.model_defintions.model_base import OutputDataNode


def run_model_tier1(model, manure_results, output_dict):
    # print("running model tier 1", model)
    # output_dict[model.__class__.__name__] = []
    model_result = model.run_model(manure_results)
    model_name = model.__class__.__name__

    if model_name == "GrassYield":
        output_dict[model.grass_type] = model_result
    else:
        output_dict[model_name] = model_result
    # for result in model_result:
    #     output_dict[model.__class__.__name__].append(result)


def run_model_tier2(model, manure_results, ero_node, yield_node, output_dict):
    # print("running model tier 2", model)
    model_result = model.run_model(manure_results, ero_node, yield_node)
    output_dict[model.__class__.__name__] = model_result


def run_parallel(model_yield, model_rain, model_ero, model_phos, model_nit, p_manure_results, model_sci, model_grass1, model_grass2):
    # first run yield, rain, ero
    # second run phos, nit
    # Create a list to hold the processes
    processes = []
    if model_grass1 is None:
        inputs = [(model_yield, p_manure_results), (model_rain, p_manure_results), (model_ero, p_manure_results)]
    else:
        inputs = [(model_yield, p_manure_results), (model_rain, p_manure_results), (model_ero, p_manure_results),
                  (model_grass1, p_manure_results), (model_grass2, p_manure_results)]

    # Create a queue to hold the outputs
    # output_queue = multiprocessing.Queue()
    manager = multiprocessing.Manager()
    results_dict = manager.dict()

    for f in inputs:
        # print(inputs[0][0], inputs[0][1])
        p = multiprocessing.Process(target=run_model_tier1, args=(inputs[0][0], inputs[0][1], results_dict))
        processes.append(p)
        inputs = inputs[1:]

    # Start the processes
    for p in processes:
        p.start()

    # Wait for the processes to finish
    for p in processes:
        p.join()
        # Get the outputs from the queue
    outputs = []
    # while not output_queue.empty():
    #     outputs.append(output_queue.get())
    ero_data = results_dict["Erosion"][0]
    rain_data = results_dict["Runoff"]
    is_grass = False
    grass_array = []

    for val in results_dict:
        if "Bluegrass-clover" == val or "Orchardgrass-clover" == val or "Timothy-clover" == val:
            is_grass = True
            if len(results_dict[val]) == 2:
                yield_data = results_dict[val]
            else:
                grass_array.append(results_dict[val][0])
    if not is_grass:
        yield_data = results_dict["CropYield"]


    # # start second tier
    processes = []
    inputs = [(model_phos, p_manure_results, ero_data, yield_data),
              (model_nit, p_manure_results, ero_data, yield_data),
              (model_sci, p_manure_results, ero_data, yield_data)
              ]
    # Create a queue to hold the outputs
    # output_queue = multiprocessing.Queue()
    manager = multiprocessing.Manager()
    results_dict = manager.dict()

    for f in inputs:
        p = multiprocessing.Process(target=run_model_tier2,
                                    args=(inputs[0][0], inputs[0][1], inputs[0][2], inputs[0][3], results_dict))
        processes.append(p)
        inputs = inputs[1:]

    # Start the processes
    for p in processes:
        p.start()

    # Wait for the processes to finish
    for p in processes:
        p.join()
        # Get the outputs from the queue
    # while not output_queue.empty():
    #     outputs.append(output_queue.get())

    nitrate_data = results_dict["NitrateLeeching"]
    phos_data = results_dict["PhosphorousLoss"]
    sci_data = results_dict["SoilIndex"]
    outputs = [*yield_data, ero_data, *rain_data, *nitrate_data, *phos_data, *sci_data, *grass_array]
    # start second tier
    return outputs

