from abc import ABC

from grazescape.model_defintions.model_base import ModelBase, OutputDataNode
from pyper import *
import numpy as np

## this script logic is meant to go through the process of calculating
## rotational average potential nitrate leaching rate for a given grid cell.

## for each grid cell, retrieve the soil yield potential class (1-3), organic matter,
##      drainage class (1-4), calculated cropYield (bushels for corn/soy/wheat, tons for other),
##      calculated erosion rate

## if-then statement to go through each rotation type


# user defined variables
PctFertN
PctManrN
# raster defined variables
OM
drainClass
Nresponse
## initialize variable to keep track of leachable N for each year of rotation
rotYrs = if crop = cc, 1
    if crop = cg, 2
    if crop = cso, 3
    if crop = dr, 5
    if crop = pt, 1
leachN = []
leachN = [0 for i in range(rotYrs)]  ## 1-d array with length equal to number of years of rotation
## Begin loop for each crop year
## Determine input parameters for model
## find corresponding row index in NitrateModelInputs spreadsheets
# spreadsheed defined variables
fertNrec ## see NitrateModelInputs, based on either soil type or organic matter (Ninputs tab)
# if crop = cs or cn, fertNrec depends on raster file nResponse
# if crop = sb or af, fertNrec = 0
# if crop = pt, ps, ot, fertNrec depends on soil OM
NfixPct # (Ninputs tab)
NH3loss # (Ninputs tab)
denitLoss # see NitrateModelInputs spreadsheet (Denitr tab)
# variables calculated
fertN = PctFertN * fertNrec  ## actual fertilizer N applied in lb/ac
manrN = PctManrN * fertNrec  ## actual manure N applied in lb/ac
precip = 32  ## varies by region, inches/year (ridgeValley = 43, driftless = 44, ne = 35, cb = 38)
precN = 0.5 * precip * 0.226  ## precipitation N inputs in lb/ac
dryN = precN  ## assume dry deposition is equal to precipitation, lb/ac
harvN = cropYield * 2000 * Nharv_content  ## harvested N output, lb/ac (crop yield in tons dm, convert to lbs dm) # dry lot yield = 0
NfixPct # defined from NitrateModelInputs spreadsheet
fixN = harvN * NfixPct / 100 + 3  ## N fixation input, lb/ac
NH3_N = fertN * NH3loss / 100  ## ammonia loss output, lb/ac 
denitN = fertN * denitLoss / 100  ## denitrification loss,
erosN = erosion * OM * 2  ## note that OM is in units of % ## erosion from models = tons/acre
grazed_manureN # (Ninputs tab)
inputsN = fertN + manrN + precN + dryN + fixN + grazed_manureN
gasN = 0.01 * inputsN  ## misc gases are estimated as 1% of inputs
NH3senN = 8  ## ammonia loss at senescence
runoffN = 0
outputsN = harvN + NH3_N + denitN + erosN + gasN + NH3senN + runoffN
leachN(i) = inputsN - outputsN


rotLeachN = mean(leachN) # this is average across rotation crop year (time) ## if rotLeachN < 0, rotLeachN = 0 

#from feedbreakdown
self.nutrients = pd.read_csv(r"grazescape\model_defintions\nutrients.csv")
self.NRC = pd.read_csv(r"grazescape\model_defintions\NRC_2001.csv")
#Run as cell by cell value.  Use the cell by cell values from other models(yield, errosion ext)
#raster is read between the ranges of x and y, dispite what the field looks like.  if no value -999 is returned

#feed_breakdown.py will make a good example of how to work with excel files.

#To do these calcs per cell, and end up with an array of values for each cell.  Then add up
#Where exactly should this fall?  set up triggers for when errosion and yeilds are finished
#Look into better ways to read Nitrate model inputs excel file.  Maybe set up dict?  Probably just read with excel 
#python tools.  

#Tasks:
#Get and upload all needed rasters
#Set up calls in views.py and model base.  This will include timing to run after all other dependancy models are finished

#Set up basic logic for model: can reflect yeild for the cell by cell calc, also ploss for simular variable logic
#Make space in front end for outputs
#make sure png in produced and retrivable. 