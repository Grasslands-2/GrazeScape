from grazescape.model_defintions.model_base import ModelBase, OutputDataNode


class DryLot(ModelBase):
    def __init__(self, request, active_region, file_name=None):
        super().__init__(request, active_region, file_name)
        self.crop_list = []
        self.test_counter = 0

    def run_model(self, manure_results):
        return_data = []
        sand = self.raster_inputs["sand"].flatten()
        yield_dl = sand * 2
        dry_lot_yield = OutputDataNode("Dry Lot", "", "", "Dry Lot", "")
        rotation_avg = OutputDataNode("Rotational Average", "Total dry matter yield (tons/ac/yr)",
                                      "Total dry matter production (tons/yr)",
                                      "Total dry matter yield (tons/ac/yr)", "Total dry matter yield (tons/ac/yr)")
        return_data.append(dry_lot_yield)
        return_data.append(rotation_avg)
        rotation_avg.set_data(yield_dl)
        dry_lot_yield.set_data(yield_dl)
        dry_lot_yield.set_data_alternate(yield_dl)

        return return_data
