import multiprocessing
import pickle


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
    output_dict[model.__class__.__name__] = model_result
    # for result in model_result:
    #     output_dict[model.__class__.__name__].append(result)


def run_model_tier2(model, manure_results, ero_node, yield_node, output_dict):
    print("running model tier 2", model)
    model_result = model.run_model(manure_results, ero_node, yield_node)
    output_dict[model.__class__.__name__] = model_result


def run_parallel(model_yield, model_rain, model_ero, model_phos, model_nit, p_manure_results, model_sci):
    # first run yield, rain, ero
    # second run phos, nit
    # Create a list to hold the processes
    processes = []
    inputs = [(model_yield, p_manure_results), (model_rain, p_manure_results), (model_ero, p_manure_results)]
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
    if "GrassYield" in results_dict:
        yield_data = results_dict["GrassYield"]
    else:
        yield_data = results_dict["CropYield"]
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
    outputs = [*yield_data, ero_data, *rain_data, *nitrate_data, *phos_data, *sci_data]
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
