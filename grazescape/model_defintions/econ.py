from grazescape.model_defintions.model_base import ModelBase, OutputDataNode
import math


class Econ(ModelBase):
    def __init__(self, request, file_name=None):
        super().__init__(request, file_name)

    def run_model(self):
        # print('IN ECON MODAL PYTHON SCRIPT!!!')
        # return_data = []
        # print(request.POST)
        # alfalfaMachCost = request.POST.get("model_parameters[alfalfaMachCost]")
        # alfalfaMachCostY1 = request.POST.get("model_parameters[alfalfaMachCostY1]")
        # alfalfaPestCost = request.POST.get("model_parameters[alfalfaPestCost]")
        # alfalfaSeedCost = request.POST.get("model_parameters[alfalfaSeedCost]")
        # cornMachCost = request.POST.get("model_parameters[cornMachCost]")
        # cornPestCost = request.POST.get("model_parameters[cornPestCost]")
        # cornSeedCost = request.POST.get("model_parameters[cornSeedCost]")
        # grassMachCost = request.POST.get("model_parameters[grassMachCost]")
        # grassPestCost = request.POST.get("model_parameters[grassPestCost]")
        # grassSeedCost = request.POST.get("model_parameters[grassSeedCost]")
        # oatMachCost = request.POST.get("model_parameters[oatMachCost]")
        # oatPestCost = request.POST.get("model_parameters[oatPestCost]")
        # oatSeedCost = request.POST.get("model_parameters[oatSeedCost]")
        # soyMachCost = request.POST.get("model_parameters[soyMachCost]")
        # soyPestCost = request.POST.get("model_parameters[soyPestCost]")
        # soySeedCost = request.POST.get("model_parameters[soySeedCost]")
        # fertNPrice = request.POST.get("model_parameters[fertNPrice]")
        # fertPPrice = request.POST.get("model_parameters[fertPPrice]")
        # #field variables
        # land_area = request.POST.get("model_parameters[land_area]")
        # land_cost = request.POST.get("model_parameters[land_cost]")
        # crop = request.POST.get("model_parameters[rotation_econ]")
        # cover_crop = request.POST.get("model_parameters[crop_cover]")
        # fert_p_perc = request.POST.get("model_parameters[fert_p_perc]")/100
        # fert_n_perc = request.POST.get("model_parameters[fert_n_perc]")/100


        print('IN ECON MODAL PYTHON SCRIPT!!!')
        return_data = []
        print(self.model_parameters)
        #sceanrio variables
        alfalfaMachCost = float(self.model_parameters["alfalfaMachCost"])
        alfalfaMachCostY1 = float(self.model_parameters["alfalfaMachCostY1"])
        alfalfaPestCost = float(self.model_parameters["alfalfaPestCost"])
        alfalfaSeedCost = float(self.model_parameters["alfalfaSeedCost"])
        cornMachCost = float(self.model_parameters["cornMachCost"])
        cornPestCost = float(self.model_parameters["cornPestCost"])
        cornSeedCost = float(self.model_parameters["cornSeedCost"])
        grassMachCost = float(self.model_parameters["grassMachCost"])
        grassPestCost = float(self.model_parameters["grassPestCost"])
        grassSeedCost = float(self.model_parameters["grassSeedCost"])
        oatMachCost = float(self.model_parameters["oatMachCost"])
        oatPestCost = float(self.model_parameters["oatPestCost"])
        oatSeedCost = float(self.model_parameters["oatSeedCost"])
        soyMachCost = float(self.model_parameters["soyMachCost"])
        soyPestCost = float(self.model_parameters["soyPestCost"])
        soySeedCost = float(self.model_parameters["soySeedCost"])
        fertNPrice = float(self.model_parameters["fertPCost"])
        fertPPrice = float(self.model_parameters["fertNCost"])
        #field variables
        land_area = float(self.model_parameters["land_area"])
        land_cost = 0 #float(self.model_parameters["land_cost"])
        crop = self.model_parameters["crop"]
        cover_crop = self.model_parameters["crop_cover"]
        fert_p_perc = float(self.model_parameters["fert_p_perc"])/100
        fert_n_perc = float(self.model_parameters["fert_n_perc"])/100
        print("fert_n_perc decimal check!!!!")
        print(fert_n_perc)
        print(fert_p_perc)
        print('CROP!!!')
        print(crop)
        cost_of_field = 0
        cost_per_acre = 0
        cost_of_fert_per_acre = 0
        fertp_cost_per_acre = 0
        fertn_cost_per_acre = 0
        
        if crop == 'cc':
            cost_seed = cornSeedCost #70
            cost_pest = cornPestCost #45
            cost_mach = cornMachCost #120
            # fertp_cost_per_acre = fertPPrice * 60 # 60 from cropcover needs table.  results is $/acre in P fertilizer
            # fertn_cost_per_acre = fertNPrice * 0 # 0 from cropcover needs table.  results is $/acre in N fertilizer
            if cover_crop == 'cc':
                fertp_cost_per_acre = fertPPrice * 60 # 60 from cropcover needs table.  results is $/acre in P fertilizer
                fertn_cost_per_acre = fertNPrice * 0 # 0 from cropcover needs table.  results is $/acre in N fertilizer
            if cover_crop == 'gcis' or cover_crop == 'gcds':
                fertp_cost_per_acre = fertPPrice * 65  # 60 from cropcover needs table.  results is $/acre in P fertilizer
                fertn_cost_per_acre = fertNPrice * 120 # 0 from cropcover needs table.  results is $/acre in N fertilizer
            if cover_crop == 'nc' or None:
                fertp_cost_per_acre = fertPPrice * 60  # 60 from cropcover needs table.  results is $/acre in P fertilizer
                fertn_cost_per_acre = fertNPrice * 120 # 0 from cropcover needs table.  results is $/acre in N fertilizer
            #cost_of_fert_per_acre = ((fertp_cost_per_acre * fert_p_perc) + (fertn_cost_per_acre * fert_n_perc))
            cost_of_fert_per_acre = ((fertp_cost_per_acre * fert_p_perc) + (fertn_cost_per_acre * fert_n_perc))
            print(cost_of_fert_per_acre)
            cost_per_acre = (cost_of_fert_per_acre + cost_seed + cost_pest + cost_mach + (land_cost))
            #cost_per_acre = cost_of_field/land_area
        elif crop == 'cg':
            cost_seed = (cornSeedCost + soySeedCost)/2
            cost_pest = (cornPestCost + soyPestCost)/2
            cost_mach = (cornMachCost + soyMachCost)/2
            if cover_crop == 'cc':
                fertp_cost_per_acre = fertPPrice * 50  
                fertn_cost_per_acre = fertNPrice * 0 
            if cover_crop == 'gcis' or cover_crop == 'gcds':
                fertp_cost_per_acre = fertPPrice * 47.5  
                fertn_cost_per_acre = fertNPrice * 60 
            if cover_crop == 'nc' or None:
                fertp_cost_per_acre = fertPPrice * 50  
                fertn_cost_per_acre = fertNPrice * 60 
            #cost_of_fert_per_acre = ((fertp_cost_per_acre * fert_p_perc) + (fertn_cost_per_acre * fert_n_perc))
            cost_of_fert_per_acre = ((fertp_cost_per_acre * fert_p_perc) + (fertn_cost_per_acre * fert_n_perc))
            cost_per_acre = (cost_of_fert_per_acre + cost_seed + cost_pest + cost_mach + (land_cost))
            #cost_per_acre = cost_of_field/land_area

        elif crop == 'cso':
            cost_seed = (cornSeedCost + soySeedCost + oatSeedCost)/3
            cost_pest = (cornPestCost + soyPestCost + oatPestCost)/3
            cost_mach = (cornMachCost + soyMachCost + oatMachCost)/3

            fertp_cost_per_acre = fertPPrice * 46.67  # 46.67 from cropcover needs table.  results is $/acre in P fertilizer
            fertn_cost_per_acre = fertNPrice * 60 # 60 from cropcover needs table.  results is $/acre in N fertilizer
            cost_of_fert_per_acre = ((fertp_cost_per_acre * fert_p_perc) + (fertn_cost_per_acre * fert_n_perc))
            cost_per_acre = (cost_of_fert_per_acre + cost_seed + cost_pest + cost_mach + (land_cost))
            #cost_per_acre = cost_of_field/land_area

        elif crop == 'dl':
            cost_seed = 0
            cost_pest = 0
            cost_mach = 0

            fertp_cost_per_acre = 0
            fertn_cost_per_acre = 0
            cost_of_fert_per_acre = ((fertp_cost_per_acre * fert_p_perc) + (fertn_cost_per_acre * fert_n_perc))
            cost_per_acre = (cost_of_fert_per_acre + cost_seed + cost_pest + cost_mach + (land_cost))
            #cost_per_acre = cost_of_field/land_area

        elif crop == 'dr':
            cost_seed = ((cornSeedCost*2) + alfalfaSeedCost)/5
            cost_pest = ((cornPestCost*2) + (alfalfaPestCost*3))/5
            cost_mach = ((cornMachCost*2) + (alfalfaMachCost*2 + alfalfaMachCostY1))/5 # +89 to account for the extra cost in the planting alfalfa year

            fertp_cost_per_acre = fertPPrice * 49  # 49 from cropcover needs table.  results is $/acre in P fertilizer
            fertn_cost_per_acre = fertNPrice * 52 #  52 from cropcover needs table.  results is $/acre in N fertilizer
            #cost_of_fert_per_acre = ((fertp_cost_per_acre * fert_p_perc) + (fertn_cost_per_acre * fert_n_perc))
            cost_of_fert_per_acre = ((fertp_cost_per_acre * fert_p_perc) + (fertn_cost_per_acre * fert_n_perc))
            cost_per_acre = (cost_of_fert_per_acre + cost_seed + cost_pest + cost_mach + (land_cost))
            #cost_per_acre = cost_of_field/land_area

        elif crop == 'pt':
            cost_seed = grassSeedCost
            cost_pest = grassPestCost
            cost_mach = grassMachCost

            fertp_cost_per_acre = 40
            fertn_cost_per_acre = 2
            cost_of_fert_per_acre = ((fertp_cost_per_acre * fert_p_perc) + (fertn_cost_per_acre * fert_n_perc))
            cost_per_acre = (cost_of_fert_per_acre + cost_seed + cost_pest + cost_mach + (land_cost))
            #cost_per_acre = cost_of_field/land_area

        
        # cost_of_fert_per_acre = ((fertp_cost_per_acre * fert_p_perc) + (fertn_cost_per_acre * fert_n_perc))
        # cost_per_acre = (cost_of_fert_per_acre + cost_seed + cost_pest + cost_mach + land_cost)
        # #cost_per_acre = cost_of_field/land_area
        #total_operations_cost = total_operations_cost + cost_of_field
        # data_array.append(cost_of_field)
        # data_array.append(cost_per_acre)
        # print(cost_of_fert_per_acre)
        # print(cost_of_field)
        print("COST PER ACRE!")
        print(cost_per_acre)
        #data = [cost_per_acre]
        #return_data.append(data)
        #return_data.append(model_type)
        #return_data.append("model_type":'econ')
        #return_data.append({"data":[cost_per_acre]})
        return_data = OutputDataNode("econ", "Costs (dollars/acre/year)","Costs (Dollars/year)")
        return_data.set_data(cost_per_acre)
        
        # fields_data_array.append(data_array)
        # print("OPERATION TOTAL!")
        # print(total_operations_cost)
        # fields_data_array.append(total_operations_cost)
        # print(fields_data_array)
            
        return [return_data]  
