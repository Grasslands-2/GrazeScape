import multiprocessing
import pickle
from grazescape.model_defintions.model_base import OutputDataNode

# Define the functions that will run in parallel
def func1(x, output_queue):
    y = x * 2

    output_queue.put((y, "test1"))


def func2(x, output_queue):
    y = x ** 2
    output_queue.put(y)


def func3(x, output_queue):
    y = x + 1
    output_queue.put(y)


def run_model_tier1(model, manure_results, output_dict):
    print("running model", model)
    # output_dict[model.__class__.__name__] = []
    model_result = model.run_model(manure_results)
    model_name = model.__class__.__name__
    # print(output_dict)
    # print(model_name)
    # print(model_name in output_dict)
    if model_name == "GrassYield":
        print("adding to existing model")
        output_dict[model.grass_type] = model_result
    else:
        output_dict[model_name] = model_result
    # for result in model_result:
    #     output_dict[model.__class__.__name__].append(result)


def run_model_tier2(model, manure_results, ero_node, yield_node, output_dict):
    print("running model tier 2", model)
    model_result = model.run_model(manure_results, ero_node, yield_node)
    output_dict[model.__class__.__name__] = model_result


def run_parallel(model_yield, model_rain, model_ero, model_phos, model_nit, p_manure_results, model_sci,model_grass1, model_grass2):
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
        print(inputs[0][0], inputs[0][1])
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
    print("output$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$", results_dict)
    ero_data = results_dict["Erosion"][0]
    rain_data = results_dict["Runoff"]
    is_grass = False
    grass_array = []
    grass_matrix = [
                    ["<1 day", 0, 0, 0],
                    ["1 day", 0, 0, 0],
                    ["3 days", 0, 0, 0],
                    ["7 days", 0, 0, 0],
                    ["Continuous", 0, 0, 0]
    ]
    for val in results_dict:
        print("checking for grass values", val)
        if "Bluegrass-clover" == val or "Orchardgrass-clover" == val or "Timothy-clover" == val:
            is_grass = True
            if len(results_dict[val]) == 2:
                print("got primary yield", val)
                yield_data = results_dict[val]
            else:
                grass_array.append(results_dict[val][0])
    if not is_grass:
        yield_data = results_dict["CropYield"]

    # matrix_out = OutputDataNode("grass_matrix", "", "", "", "")
    # matrix_out.set_data(test_matrix)
    # print(ero_data)
    # print(yield_data)
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
        print(inputs[0][0], inputs[0][1])
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
    print("tier 2")
    print("output$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$", results_dict)
    nitrate_data = results_dict["NitrateLeeching"]
    phos_data = results_dict["PhosphorousLoss"]
    sci_data = results_dict["SoilIndex"]
    outputs = [*yield_data, ero_data, *rain_data, *nitrate_data, *phos_data, *sci_data, *grass_array]
    # start second tier
    return outputs


if __name__ == "__main__":

    # Create a list of input values
    inputs = [1, 2, 3]

    # Create a list to hold the processes
    processes = []

    # Create a queue to hold the outputs
    output_queue = multiprocessing.Queue()

    # Create a process for each function and append it to the list
    for f in [func1, func2, func3]:
        p = multiprocessing.Process(target=f, args=(inputs[0], output_queue))
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
    while not output_queue.empty():
        outputs.append(output_queue.get())

    # Print the outputs
    print(outputs)