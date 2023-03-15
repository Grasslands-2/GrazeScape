var fieldArraystandin = []
Ext.create('Ext.data.Store', {
	storeId: 'fieldSummaryStore',
	alternateClassName: 'DSS.FieldSummaryStore',
	fields:[ 'name', 'soilP', 'soilOM', 'rotationVal', 'rotationDisp', 'tillageVal', 
	'tillageDisp', 'coverCropDisp', 'coverCropVal',
		'onContour','fertPercP','manuPercP','fertPercN','manuPercN','grassSpeciesVal','grassSpeciesDisp',
		'interseededClover','grazeDensityVal','grazeDensityDisp','manurePastures', 'grazeDairyLactating',
		'grazeDairyNonLactating', 'grazeBeefCattle','area', 'perimeter','fence_type',
        'fence_cost','fence_unit_cost','rotationFreqVal','rotationFreqDisp','landCost'],
		sorters: ['name'],
	data: fieldArraystandin
});
//This function is used to create the field summary after the models are run.  it needs the pmanure array of values to completely be filled, 
//which is why it is run after the models finsih.
function Assemblefieldsummarry(fieldArray,pmanureReturn_array){
    var assembledArray = []
    var fieldArrayItem = []
    pmanureReturn_array.forEach((pmr) => {
        switch(pmr[3]){
            case "pt":
            for(i in fieldArray){
                slicedId = fieldArray[i].id.slice(8)
                console.log(slicedId)
                console.log(pmr[1])
                if(slicedId == pmr[1] ){
                    console.log("in if for fieldarray")
                    fieldArrayItem = fieldArray[i]
                    console.log(fieldArrayItem)
                    var pt_rt = ''
                    if(pmr[5] == "cn"){
                    //if(fieldArray[i].rotationVal == "pt-cn"){
                        assembledArray.push({
                            field_name: pmr[0],
                            crop_ro: "Continuous Pasture",
                            area:fieldArrayItem.area,
                            year: 1,
                            crop: "Grass",
                            soilP: fieldArrayItem.soilP,
                            soilOM: fieldArrayItem.soilOM,
                            Nrec: pmr[4].pt_cn.n_rec,
                            manuPercN: fieldArrayItem.manuPercN,
                            fertPercN: fieldArrayItem.fertPercN,
                            manuAppliedN: (fieldArrayItem.manuPercN/100) * pmr[4].pt_cn.n_man,
                            fertAppliedN: (fieldArrayItem.fertPercN/100) * pmr[4].pt_cn.n_rec,
                            pNeeds: pmr[4].pt_cn.p_needs,
                            manuPercP: pmr[4].pt_cn.man_p_per,
                            nManure: pmr[4].pt_cn.n_man,
                            fertPercP: fieldArrayItem.fertPercP,
                            manuAppliedP:(pmr[4].pt_cn.man_p_per/100) * pmr[4].pt_cn.p_needs,
                            fertAppliedP: (fieldArrayItem.fertPercP/100) * pmr[4].pt_cn.p_needs,
                            tillageDisp: "NA",
                            coverCropDisp: "NA",
                            onContour: "NA",
                            grassSpeciesDisp: fieldArrayItem.grassSpeciesDisp,
                            interseededClover: fieldArrayItem.interseededClover,
                            grazeDensityDisp: fieldArrayItem.grazeDensityDisp,
                            rotationFreqDisp:fieldArrayItem.rotationFreqDisp,
                            landCost:fieldArrayItem.landCost,
                        })
                    }else if(pmr[5] == "rt"){
                        console.log("in else")
                        console.log(pmr[4])
                        assembledArray.push({
                            field_name: pmr[0],
                            crop_ro: "Rotational Pasture",
                            area:fieldArrayItem.area,
                            year: 1,
                            crop: "Grass",
                            soilP: fieldArrayItem.soilP,
                            soilOM: fieldArrayItem.soilOM,
                            Nrec: pmr[4].pt_rt.n_rec,
                            manuPercN: fieldArrayItem.manuPercN,
                            fertPercN: fieldArrayItem.fertPercN,
                            manuAppliedN: (fieldArrayItem.manuPercN/100) * pmr[4].pt_rt.n_man,
                            fertAppliedN: (fieldArrayItem.fertPercN/100) * pmr[4].pt_rt.n_rec,
                            pNeeds: pmr[4].pt_rt.p_needs,
                            manuPercP: pmr[4].pt_rt.man_p_per,
                            nManure: pmr[4].pt_rt.n_man,
                            fertPercP: fieldArrayItem.fertPercP,
                            manuAppliedP:(pmr[4].pt_rt.man_p_per/100) * pmr[4].pt_rt.p_needs,
                            fertAppliedP: (fieldArrayItem.fertPercP/100) * pmr[4].pt_rt.p_needs,
                            tillageDisp: "NA",
                            coverCropDisp: "NA",
                            onContour: "NA",
                            grassSpeciesDisp: fieldArrayItem.grassSpeciesDisp,
                            interseededClover: fieldArrayItem.interseededClover,
                            grazeDensityDisp: "NA",
                            rotationFreqDisp:fieldArrayItem.rotationFreqDisp,
                            landCost:fieldArrayItem.landCost,
                        })
                    }
                    console.log(assembledArray)
                }
            }
            break;
            case "cc":
            for(i in fieldArray){
                slicedId = fieldArray[i].id.slice(8)
                console.log(slicedId)
                console.log(pmr[1])
                if(slicedId == pmr[1]){
                    console.log("in if for fieldarray")
                    fieldArrayItem = fieldArray[i]
                    assembledArray.push({
                        field_name: pmr[0],
                        crop_ro: "Continuous Corn",
                        area:fieldArrayItem.area,
                        year: 1,
                        crop: "Corn Grain",
                        soilP: fieldArrayItem.soilP,
                        soilOM: fieldArrayItem.soilOM,
                        Nrec: pmr[4].cn.n_rec,
                        manuPercN: fieldArrayItem.manuPercN,
                        fertPercN: fieldArrayItem.fertPercN,
                        manuAppliedN: (fieldArrayItem.manuPercN/100) * pmr[4].cn.n_man,
                        fertAppliedN: (fieldArrayItem.fertPercN/100) * pmr[4].cn.n_rec,
                        pNeeds: pmr[4].cn.p_needs,
                        manuPercP: pmr[4].cn.man_p_per,
                        nManure: pmr[4].cn.n_man,
                        fertPercP: fieldArrayItem.fertPercP,
                        manuAppliedP:(pmr[4].cn.man_p_per/100) * pmr[4].cn.p_needs,
                        fertAppliedP: (fieldArrayItem.fertPercP/100) * pmr[4].cn.p_needs,
                        tillageDisp: fieldArrayItem.tillageDisp,
                        coverCropDisp: fieldArrayItem.coverCropDisp,
                        onContour: fieldArrayItem.onContour,
                        grassSpeciesDisp: "NA",
                        interseededClover: "NA",
                        grazeDensityDisp: "NA",
                        rotationFreqDisp: "NA",
                        landCost:fieldArrayItem.landCost,
                    })
                    console.log(assembledArray)
                }
            }
            break;
            case "cg":
            for(i in fieldArray){
                slicedId = fieldArray[i].id.slice(8)
                //console.log(slicedId)
                //console.log(pmr[1])
                if(slicedId == pmr[1]){
                    console.log("in if for fieldarray")
                    fieldArrayItem = fieldArray[i]
                    assembledArray.push({
                        field_name: pmr[0],
                        crop_ro: "Cash Grains",
                        area:fieldArrayItem.area,
                        year: 1,
                        crop: "Soy Beans",
                        soilP: fieldArrayItem.soilP,
                        soilOM: fieldArrayItem.soilOM,
                        Nrec: pmr[4].sb.n_rec,
                        manuPercN: fieldArrayItem.manuPercN,
                        fertPercN: fieldArrayItem.fertPercN,
                        manuAppliedN: (fieldArrayItem.manuPercN/100) * pmr[4].sb.n_man,
                        fertAppliedN: (fieldArrayItem.fertPercN/100) * pmr[4].sb.n_rec,
                        pNeeds: pmr[4].sb.p_needs,
                        manuPercP: pmr[4].sb.man_p_per,
                        fertPercP: fieldArrayItem.fertPercP,
                        nManure: pmr[4].sb.n_man,
                        manuAppliedP:(pmr[4].sb.man_p_per/100) * pmr[4].sb.p_needs,
                        fertAppliedP: (fieldArrayItem.fertPercP/100) * pmr[4].sb.p_needs,
                        tillageDisp: fieldArrayItem.tillageDisp,
                        coverCropDisp: fieldArrayItem.coverCropDisp,
                        onContour: fieldArrayItem.onContour,
                        grassSpeciesDisp: "NA",
                        interseededClover: "NA",
                        grazeDensityDisp: "NA",
                        rotationFreqDisp: "NA",
                        landCost:fieldArrayItem.landCost,
                    })
                    assembledArray.push({
                        field_name: pmr[0],
                        crop_ro: "Cash Grains",
                        area:fieldArrayItem.area,
                        year: 2,
                        crop: "Corn Grain",
                        soilP: fieldArrayItem.soilP,
                        soilOM: fieldArrayItem.soilOM,
                        Nrec: pmr[4].cn.n_rec,
                        manuPercN: fieldArrayItem.manuPercN,
                        fertPercN: fieldArrayItem.fertPercN,
                        manuAppliedN: (fieldArrayItem.manuPercN/100) * pmr[4].cn.n_man,
                        fertAppliedN: (fieldArrayItem.fertPercN/100) * pmr[4].cn.n_rec,
                        pNeeds: pmr[4].cn.p_needs,
                        manuPercP: pmr[4].cn.man_p_per,
                        nManure: pmr[4].cn.n_man,
                        fertPercP: fieldArrayItem.fertPercP,
                        manuAppliedP:(pmr[4].cn.man_p_per/100) * pmr[4].cn.p_needs,
                        fertAppliedP: (fieldArrayItem.fertPercP/100) * pmr[4].cn.p_needs,
                        tillageDisp: fieldArrayItem.tillageDisp,
                        coverCropDisp: fieldArrayItem.coverCropDisp,
                        onContour: fieldArrayItem.onContour,
                        grassSpeciesDisp: "NA",
                        interseededClover: "NA",
                        grazeDensityDisp: "NA",
                        rotationFreqDisp: "NA",
                        landCost:fieldArrayItem.landCost,
                    })
                    console.log(assembledArray)
                }
            }
            break;
            case "dr":
                for(i in fieldArray){
                    slicedId = fieldArray[i].id.slice(8)
                    console.log(slicedId)
                    console.log(pmr[1])
                    if(slicedId == pmr[1]){
                        console.log("in if for fieldarray")
                        fieldArrayItem = fieldArray[i]
                        assembledArray.push({
                            field_name: pmr[0],
                            crop_ro: "Corn Silage to Corn Grain to Alfalfa 3 yrs",
                            area:fieldArrayItem.area,
                            year: 1,
                            crop: "Corn Grain",
                            soilP: fieldArrayItem.soilP,
                            soilOM: fieldArrayItem.soilOM,
                            Nrec: pmr[4].cn.n_rec,
                            manuPercN: fieldArrayItem.manuPercN,
                            fertPercN: fieldArrayItem.fertPercN,
                            manuAppliedN: (fieldArrayItem.manuPercN/100) * pmr[4].cn.n_man,
                            fertAppliedN: (fieldArrayItem.fertPercN/100) * pmr[4].cn.n_rec,
                            pNeeds: pmr[4].cn.p_needs,
                            manuPercP: pmr[4].cn.man_p_per,
                            nManure: pmr[4].cn.n_man,
                            fertPercP: fieldArrayItem.fertPercP,
                            manuAppliedP:(pmr[4].cn.man_p_per/100) * pmr[4].cn.p_needs,
                            fertAppliedP: (fieldArrayItem.fertPercP/100) * pmr[4].cn.p_needs,
                            tillageDisp: fieldArrayItem.tillageDisp,
                            coverCropDisp: fieldArrayItem.coverCropDisp,
                            onContour: fieldArrayItem.onContour,
                            grassSpeciesDisp: "NA",
                            interseededClover: "NA",
                            grazeDensityDisp: "NA",
                            rotationFreqDisp: "NA",
                            landCost:fieldArrayItem.landCost,
                        })
                        assembledArray.push({
                            field_name: pmr[0],
                            crop_ro: "Corn Silage to Corn Grain to Alfalfa 3 yrs",
                            area:fieldArrayItem.area,
                            year: 2,
                            crop: "Corn Silage",
                            soilP: fieldArrayItem.soilP,
                            soilOM: fieldArrayItem.soilOM,
                            Nrec: pmr[4].cs.n_rec,
                            manuPercN: fieldArrayItem.manuPercN,
                            fertPercN: fieldArrayItem.fertPercN,
                            manuAppliedN: (fieldArrayItem.manuPercN/100) * pmr[4].cs.n_man,
                            fertAppliedN: (fieldArrayItem.fertPercN/100) * pmr[4].cs.n_rec,
                            pNeeds: pmr[4].cs.p_needs,
                            manuPercP: pmr[4].cs.man_p_per,
                            nManure: pmr[4].cs.n_man,
                            fertPercP: fieldArrayItem.fertPercP,
                            manuAppliedP:(pmr[4].cs.man_p_per/100) * pmr[4].cs.p_needs,
                            fertAppliedP: (fieldArrayItem.fertPercP/100) * pmr[4].cs.p_needs,
                            tillageDisp: fieldArrayItem.tillageDisp,
                            coverCropDisp: fieldArrayItem.coverCropDisp,
                            onContour: fieldArrayItem.onContour,
                            grassSpeciesDisp: "NA",
                            interseededClover: "NA",
                            grazeDensityDisp: "NA",
                            rotationFreqDisp: "NA",
                            landCost:fieldArrayItem.landCost,
                        })
                        assembledArray.push({
                            field_name: pmr[0],
                            crop_ro: "Corn Silage to Corn Grain to Alfalfa 3 yrs",
                            area:fieldArrayItem.area,
                            year: 3,
                            crop: "Start Alfalfa",
                            soilP: fieldArrayItem.soilP,
                            soilOM: fieldArrayItem.soilOM,
                            Nrec: pmr[4].as.n_rec,
                            manuPercN: fieldArrayItem.manuPercN,
                            fertPercN: fieldArrayItem.fertPercN,
                            manuAppliedN: (fieldArrayItem.manuPercN/100) * pmr[4].as.n_man,
                            fertAppliedN: (fieldArrayItem.fertPercN/100) * pmr[4].as.n_rec,
                            pNeeds: pmr[4].as.p_needs,
                            manuPercP: pmr[4].as.man_p_per,
                            nManure: pmr[4].as.n_man,
                            fertPercP: fieldArrayItem.fertPercP,
                            manuAppliedP:(pmr[4].as.man_p_per/100) * pmr[4].as.p_needs,
                            fertAppliedP: (fieldArrayItem.fertPercP/100) * pmr[4].as.p_needs,
                            tillageDisp: fieldArrayItem.tillageDisp,
                            coverCropDisp: fieldArrayItem.coverCropDisp,
                            onContour: fieldArrayItem.onContour,
                            grassSpeciesDisp: "NA",
                            interseededClover: "NA",
                            grazeDensityDisp: "NA",
                            rotationFreqDisp: "NA",
                            landCost:fieldArrayItem.landCost,
                        })
                        assembledArray.push({
                            field_name: pmr[0],
                            crop_ro: "Corn Silage to Corn Grain to Alfalfa 3 yrs",
                            area:fieldArrayItem.area,
                            year: "4-5",
                            crop: "Alfalfa",
                            soilP: fieldArrayItem.soilP,
                            soilOM: fieldArrayItem.soilOM,
                            Nrec: pmr[4].af.n_rec,
                            manuPercN: fieldArrayItem.manuPercN,
                            fertPercN: fieldArrayItem.fertPercN,
                            manuAppliedN: (fieldArrayItem.manuPercN/100) * pmr[4].af.n_man,
                            fertAppliedN: (fieldArrayItem.fertPercN) * pmr[4].af.n_rec,
                            pNeeds: pmr[4].af.p_needs,
                            manuPercP: pmr[4].af.man_p_per,
                            nManure: pmr[4].af.n_man,
                            fertPercP: fieldArrayItem.fertPercP,
                            manuAppliedP:(pmr[4].af.man_p_per/100) * pmr[4].af.p_needs,
                            fertAppliedP: (fieldArrayItem.fertPercP/100) * pmr[4].af.p_needs,
                            tillageDisp: fieldArrayItem.tillageDisp,
                            coverCropDisp: fieldArrayItem.coverCropDisp,
                            onContour: fieldArrayItem.onContour,
                            grassSpeciesDisp: "NA",
                            interseededClover: "NA",
                            grazeDensityDisp: "NA",
                            rotationFreqDisp: "NA",
                            landCost:fieldArrayItem.landCost,
                        })
                        console.log(assembledArray)
                    }
                }
            break;
            case "cso":
                for(i in fieldArray){
                    slicedId = fieldArray[i].id.slice(8)
                    console.log(slicedId)
                    console.log(pmr[1])
                    if(slicedId == pmr[1]){
                        console.log("in if for fieldarray")
                        fieldArrayItem = fieldArray[i]
                        assembledArray.push({
                            field_name: pmr[0],
                            crop_ro: "Corn Silage to Soybeans to Oats",
                            area:fieldArrayItem.area,
                            year: 1,
                            crop: "Corn Silage",
                            soilP: fieldArrayItem.soilP,
                            soilOM: fieldArrayItem.soilOM,
                            Nrec: pmr[4].cs.n_rec,
                            manuPercN: fieldArrayItem.manuPercN,
                            fertPercN: fieldArrayItem.fertPercN,
                            manuAppliedN: (fieldArrayItem.manuPercN/100) * pmr[4].cs.n_man,
                            fertAppliedN: (fieldArrayItem.fertPercN/100) * pmr[4].cs.n_rec,
                            pNeeds: pmr[4].cs.p_needs,
                            manuPercP: pmr[4].cs.man_p_per,
                            nManure: pmr[4].cs.n_man,
                            fertPercP: fieldArrayItem.fertPercP,
                            manuAppliedP:(pmr[4].cs.man_p_per/100) * pmr[4].cs.p_needs,
                            fertAppliedP: (fieldArrayItem.fertPercP/100) * pmr[4].cs.p_needs,
                            tillageDisp: fieldArrayItem.tillageDisp,
                            coverCropDisp: fieldArrayItem.coverCropDisp,
                            onContour: fieldArrayItem.onContour,
                            grassSpeciesDisp: "NA",
                            interseededClover: "NA",
                            grazeDensityDisp: "NA",
                            rotationFreqDisp: "NA",
                            landCost:fieldArrayItem.landCost,
                        })
                        assembledArray.push({
                            field_name: pmr[0],
                            crop_ro: "Corn Silage to Soybeans to Oats",
                            area:fieldArrayItem.area,
                            year: 2,
                            crop: "Soy Beans",
                            soilP: fieldArrayItem.soilP,
                            soilOM: fieldArrayItem.soilOM,
                            Nrec: pmr[4].sb.n_rec,
                            manuPercN: fieldArrayItem.manuPercN,
                            fertPercN: fieldArrayItem.fertPercN,
                            manuAppliedN: (fieldArrayItem.manuPercN/100) * pmr[4].sb.n_man,
                            fertAppliedN: (fieldArrayItem.fertPercN/100) * pmr[4].sb.n_rec,
                            pNeeds: pmr[4].sb.p_needs,
                            manuPercP: pmr[4].sb.man_p_per,
                            nManure: pmr[4].sb.n_man,
                            fertPercP: fieldArrayItem.fertPercP,
                            manuAppliedP:(pmr[4].sb.man_p_per/100) * pmr[4].sb.p_needs,
                            fertAppliedP: (fieldArrayItem.fertPercP/100) * pmr[4].sb.p_needs,
                            tillageDisp: fieldArrayItem.tillageDisp,
                            coverCropDisp: fieldArrayItem.coverCropDisp,
                            onContour: fieldArrayItem.onContour,
                            grassSpeciesDisp: "NA",
                            interseededClover: "NA",
                            grazeDensityDisp: "NA",
                            rotationFreqDisp: "NA",
                            landCost:fieldArrayItem.landCost,
                        })
                        assembledArray.push({
                            field_name: pmr[0],
                            crop_ro: "Corn Silage to Soybeans to Oats",
                            area:fieldArrayItem.area,
                            year: 3,
                            crop: "Oats",
                            soilP: fieldArrayItem.soilP,
                            soilOM: fieldArrayItem.soilOM,
                            Nrec: pmr[4].ot.n_rec,
                            manuPercN: fieldArrayItem.manuPercN,
                            fertPercN: fieldArrayItem.fertPercN,
                            manuAppliedN: (fieldArrayItem.manuPercN/100) * pmr[4].ot.n_man,
                            fertAppliedN: (fieldArrayItem.fertPercN/100) * pmr[4].ot.n_rec,
                            pNeeds: pmr[4].ot.p_needs,
                            manuPercP: pmr[4].ot.man_p_per,
                            nManure: pmr[4].ot.n_man,
                            fertPercP: fieldArrayItem.fertPercP,
                            manuAppliedP:(pmr[4].ot.man_p_per/100) * pmr[4].ot.p_needs,
                            fertAppliedP: (fieldArrayItem.fertPercP/100) * pmr[4].ot.p_needs,
                            tillageDisp: fieldArrayItem.tillageDisp,
                            coverCropDisp: fieldArrayItem.coverCropDisp,
                            onContour: fieldArrayItem.onContour,
                            grassSpeciesDisp: "NA",
                            interseededClover: "NA",
                            grazeDensityDisp: "NA",
                            rotationFreqDisp: "NA",
                            landCost:fieldArrayItem.landCost,
                        })
                        console.log(assembledArray)
                    }
                }
            break;
        }
        console.log(assembledArray)
    });
    return assembledArray
}
//Grabs the pngs for a field that has been previously modeled, but is not dirty in the current model run.
//pngs are stored on Google Cloud, and the url this function calls to uses a function in the Django Python backend
//to download those pngs into local container storage for use.
function field_png_lookup(data,layer,extents){
    return new Promise(function(resolve) {
    var csrftoken = Cookies.get('csrftoken');
	console.log('data coming into ajax call')
    console.log(layer)
	console.log(data)
    $.ajaxSetup({
            headers: { "X-CSRFToken": csrftoken }
        });
    $.ajax({
    'url' : '/grazescape/field_png_lookup',
    'type' : 'POST',
    'data' : data,
    success: function(responses) {
        if(layer == 'ploss'){
            plossPNGFile = responses[0]
            console.log(plossPNGFile)
            //-------------------------------------Ploss--------------------------------------
            DSS.layer.ploss_field = new ol.layer.Image({
                visible: false,
                opacity: 1,
                updateWhileAnimating: true,
                updateWhileInteracting: true,
                source: new ol.source.ImageStatic({
                //url:'/static/grazescape/public/images/ploss'+ plossPNGFile[0]/*'String(fId) + '_' + modelruntimeFromDB + */'.png',
                url:'/static/grazescape/public/images/'+ plossPNGFile/*'String(fId) + '_' + modelruntimeFromDB + */,
                imageExtent: extents
                })
            })
            //DSS.layer.ploss_field.set('name', 'ploss'+ String(fId));
            DSS.layer.ploss_field.getSource().refresh();
            DSS.layer.ploss_field.getSource().changed();
            DSS.map.addLayer(DSS.layer.ploss_field)
            var plossGroupLayers = DSS.layer.PLossGroup.getLayers().getArray();
            plossGroupLayers.push(DSS.layer.ploss_field);
            DSS.map.removeLayer(DSS.layer.ploss_field)
        }
        if(layer == 'ero'){
            eroPNGFile = responses[0]
            DSS.layer.erosion_field = new ol.layer.Image({
                visible: false,
                updateWhileAnimating: true,
                updateWhileInteracting: true,
                source: new ol.source.ImageStatic({
                //url: '/static/grazescape/public/images/ero'+ String(fId) + '_' + modelruntimeFromDB + '.png',
                url: '/static/grazescape/public/images/' + eroPNGFile,
                imageExtent: extents
                })
            })
            //DSS.layer.erosion_field.set('name', 'ero'+ String(fId));
            var erosionGroupLayers =DSS.layer.erosionGroup.getLayers().getArray();
            erosionGroupLayers.push(DSS.layer.erosion_field);
            DSS.map.removeLayer(DSS.layer.erosion_field)
        }
        if(layer == 'nleaching'){
            nleachingPNGFile = responses[0]
            DSS.layer.nleaching_field = new ol.layer.Image({
                visible: false,
                updateWhileAnimating: true,
                updateWhileInteracting: true,
                source: new ol.source.ImageStatic({
                //url: '/static/grazescape/public/images/ero'+ String(fId) + '_' + modelruntimeFromDB + '.png',
                url: '/static/grazescape/public/images/' + nleachingPNGFile,
                imageExtent: extents
                })
            })
            var nleachingGroupLayers = DSS.layer.nleachingGroup.getLayers().getArray();
            nleachingGroupLayers.push(DSS.layer.nleaching_field);
            DSS.map.removeLayer(DSS.layer.nleaching_field)
        }
        if(layer == 'yield'){
            yieldPNGFile = responses[0]
            DSS.layer.yield_field = new ol.layer.Image({
                visible: false,
                updateWhileAnimating: true,
                updateWhileInteracting: true,
                source: new ol.source.ImageStatic({
                //url: '/static/grazescape/public/images/Rotational Average'+ String(fId) + '_' + modelruntimeFromDB + '.png',
                url: '/static/grazescape/public/images/'+ yieldPNGFile,
                imageExtent: extents
                })
            })
            //DSS.layer.yield_field.set('name', 'Rotational Average'+ String(fId));
            var yieldGroupLayers = DSS.layer.yieldGroup.getLayers().getArray();
            yieldGroupLayers.push(DSS.layer.yield_field);
            DSS.map.removeLayer(DSS.layer.yield_field)
        }
		resolve([])
	},
	error: function(responses) {
		console.log('python tool call error')
		console.log(responses)
	}
	})
	})
}

function get_results_image(data){
    return new Promise(function(resolve) {
    var csrftoken = Cookies.get('csrftoken');
	console.log('data coming into ajax call')
	console.log(data)
    $.ajaxSetup({
            headers: { "X-CSRFToken": csrftoken }
        });
    $.ajax({
    'url' : '/grazescape/get_results_image',
    'type' : 'POST',
    'data' : data,
    success: function(responses) {
		console.log(responses)
		resolve([])
	},
	error: function(responses) {
		console.log('python tool call error')
		console.log(responses)
	}
	})
	})
}

function timeout(){
    console.log('timeout')
}
var pLossColorArray = ["#204484","#3e75b2","#90b9e4","#d2f0fa","#fcffd8","#ffdaa0","#eb9159","#d25c34","#a52d18"]
var pLossValueArray =['0',1.5,3,4.5,6,7.5,9.6,11.2,12.8,'15+']
DSS.plossBol = false
DSS.nleachBol = false
DSS.eroBol = false
DSS.runoffBol = false
DSS.yieldBol = false
// unique model time stamp holder


//This function gathers the yield data from the active scnearios fields for the yield adjustment table
function gatherYieldTableData() {
    fieldYieldArray = []
	var chartObjyieldarray = chartObj.rotation_yield_field.chartData.datasets
	for(field in chartObjyieldarray){
        console.log(chartObjyieldarray[field])
        if(chartObjyieldarray[field].scenDbID == DSS.activeScenario){
            fieldYieldArray.push({
                id: chartObjyieldarray[field].dbID,
                name: chartObjyieldarray[field].label,
                rotationVal1: chartObjyieldarray[field].cropRo,
                rotationVal2: chartObjyieldarray[field].grassRo,
                grassType: chartObjyieldarray[field].grassType,
                dMYieldAc: chartObjyieldarray[field].fieldData
            })
        }
	}
    //setting array values for each yield value
    var grassdataarray = chartObj.grass_yield_field.chartData.datasets
    var corndataarray = chartObj.corn_yield_field.chartData.datasets
    var silagedataarray = chartObj.corn_silage_yield_field.chartData.datasets
    var soydataarray = chartObj.soy_yield_field.chartData.datasets
    var oatdataarray = chartObj.oat_yield_field.chartData.datasets
    var alfalfadataarray = chartObj.alfalfa_yield_field.chartData.datasets
    //Loop through fields and pull yield data from each
    for(i in fieldYieldArray){
        var fieldID = fieldYieldArray[i].id
        for(g in grassdataarray){
            if (grassdataarray[g].dbID == fieldID && typeof(grassdataarray[g].fieldData) !== 'undefined'){
                fieldYieldArray[i].grassYieldTonsAc = grassdataarray[g].fieldData
            }
        }
        for(c in corndataarray){
            if (corndataarray[c].dbID == fieldID && typeof(corndataarray[c].fieldData) !== 'undefined'){
                fieldYieldArray[i].cornGrainBrusdAc = corndataarray[c].fieldData
            }
        }
        for(s in silagedataarray){
            if (silagedataarray[s].dbID == fieldID && typeof(silagedataarray[s].fieldData) !== 'undefined'){
                fieldYieldArray[i].cornSilageTonsAc = silagedataarray[s].fieldData
            }
            // if (silagedataarray[s].dbID == fieldID){
            //     if(typeof(fieldYieldArray[i].cornSilageTonsAc) == 'undefined'){
            //         fieldYieldArray[i].cornSilageTonsAc = null
            //     }else{
            //         fieldYieldArray[i].cornSilageTonsAc = silagedataarray[s].fieldData
            //     }
            // }
        }
        for(so in soydataarray){
            if (soydataarray[so].dbID == fieldID && typeof(soydataarray[so].fieldData) !== 'undefined'){
                fieldYieldArray[i].soyGrainBrusAc = soydataarray[so].fieldData
            }
            // if(typeof(fieldYieldArray[i].soyGrainBrusAc) == 'undefined'){
            //     fieldYieldArray[i].soyGrainBrusAc = null
            // }else{
            //     fieldYieldArray[i].soyGrainBrusAc = soydataarray[so].fieldData
            // }
            
        }
        for(o in oatdataarray){
            if (oatdataarray[o].dbID == fieldID && typeof(oatdataarray[o].fieldData) !== 'undefined'){
                fieldYieldArray[i].oatYieldBrusAc = oatdataarray[o].fieldData
            }
                
                // if(typeof(fieldYieldArray[i].soyGrainBrusAc) == 'undefined'){
                //     fieldYieldArray[i].oatYieldBrusAc = null
                // }else{
                //     fieldYieldArray[i].oatYieldBrusAc = oatdataarray[o].fieldData
                // }
                //fieldYieldArray[i].oatYieldBrusAc = oatdataarray[o].fieldData
            //}
        }
        for(a in alfalfadataarray){
            if (alfalfadataarray[a].dbID == fieldID && typeof(alfalfadataarray[a].fieldData) !== 'undefined'){
                fieldYieldArray[i].alfalfaYieldTonsAc = alfalfadataarray[a].fieldData
            }
            // if (alfalfadataarray[a].dbID == fieldID){
            //     if(typeof(fieldYieldArray[i].alfalfaYieldTonsAc) == 'undefined'){
            //         fieldYieldArray[i].alfalfaYieldTonsAc = null
            //     }else{
            //         fieldYieldArray[i].alfalfaYieldTonsAc = alfalfadataarray[a].fieldData
            //     }
            //     //fieldYieldArray[i].alfalfaYieldTonsAc = alfalfadataarray[a].fieldData
            // }
        }
        rotationValSum = fieldYieldArray[i].rotationVal1// + fieldYieldArray[i].rotationVal2
        switch(rotationValSum){
            case 'pt': 
            if(fieldYieldArray[i].rotationVal2 == 'cn'){fieldYieldArray[i].rotationDisp = 'Continuous Pasture'}
            if(fieldYieldArray[i].rotationVal2 == 'rt'){fieldYieldArray[i].rotationDisp = 'Rotational Pasture'}
            break;
            // case 'ptrt': fieldYieldArray[i].rotationDisp = 'Rotational Pasture'
            // break;
            case 'dl': fieldYieldArray[i].rotationDisp = 'Dry Lot'
            break;
            case 'cc': fieldYieldArray[i].rotationDisp = 'Continuous Corn'
            break;
            case 'cg': fieldYieldArray[i].rotationDisp = 'Cash Grain'
            break;
            case 'dr': fieldYieldArray[i].rotationDisp = 'Silage/Corn/Alfalfa 3 yrs'
            break;
            case 'cso': fieldYieldArray[i].rotationDisp = 'Silage/Soy Beans/Oats'
            break;
            default: fieldYieldArray[i].rotationDisp = 'No Rotation'
        }
    }
    console.log(fieldYieldArray)
}; 
function turnOffMappedResults() {
    DSS.MapState.destroyLegend();
    DSS.layer.yieldGroup.setVisible(false);
    DSS.layer.erosionGroup.setVisible(false);
    DSS.layer.nleachingGroup.setVisible(false);
    DSS.layer.runoffGroup.setVisible(false);
    DSS.layer.PLossGroup.setVisible(false);
}
    
var fieldYieldArray = [];
//var modelTypes = [ /*'ploss',*/'bio','econ','yield','runoff']
//var modelTypes = ['bio','econ','yield']
//Models to run.  Currently only yield since all models got wrapped up into one for the time being for efficency updates.
var modelTypes = ['yield']
//list of all the current and future charts
var chartList = [
    "grass_yield_farm", 
    "grass_yield_field",
    "ploss_farm", 
    "ploss_field",
    "soil_loss_farm", 
    "soil_loss_field",
    "nleaching_farm", 
    "nleaching_field",
    "cn_num_farm",
    "runoff_farm",
    "compare_farm",
    'corn_yield_farm',
    'corn_yield_field',
    'corn_silage_yield_farm',
    'corn_silage_yield_field',
    'soy_yield_farm',
    'soy_yield_field',
    'oat_yield_farm', 
    'oat_yield_field',
    'alfalfa_yield_farm',
    'alfalfa_yield_field',
    'rotation_yield_farm',
    'rotation_yield_field',
    'insecticide_farm',
    'insecticide_field',
    'feed_breakdown',
    'econ_farm',
    'econ_field'
]

var additionalChartInfo = {
    'grass_yield_farm': {
        group: 'Yield'
    }, 
    'grass_yield_field': {
        group: 'Yield'
    },
    'ploss_farm': {
        group: 'Nutrients'
    }, 
    'ploss_field': {
        group: 'Nutrients'
    },
    'soil_loss_farm': {
        group: 'Erosion'
    }, 
    'soil_loss_field': {
        group: 'Erosion'
    },
    'nleaching_farm': {
        group: 'Nutrients'
    }, 
    'nleaching_field': {
        group: 'Nutrients'
    },
    'cn_num_farm': {
        group: 'Runoff'
    },
    'runoff_farm': {
        group: 'Runoff'
    },
    'compare_farm': {
        group: 'Unknown'
    },
    'corn_yield_farm': {
        group: 'Yield'
    },
    'corn_yield_field': {
        group: 'Yield'
    },
    'corn_silage_yield_farm': {
        group: 'Yield'
    },
    'corn_silage_yield_field': {
        group: 'Yield'
    },
    'soy_yield_farm': {
        group: 'Yield'
    },
    'soy_yield_field': {
        group: 'Yield'
    },
    'oat_yield_farm': {
        group: 'Yield'
    }, 
    'oat_yield_field': {
        group: 'Yield'
    },
    'alfalfa_yield_farm': {
        group: 'Yield'
    },
    'alfalfa_yield_field': {
        group: 'Yield'
    },
    'rotation_yield_farm': {
        group: 'Yield'
    },
    'rotation_yield_field': {
        group: 'Yield'
    },
    'insecticide_farm': {
        group: 'Insecticide'
    },
    'insecticide_field': {
        group: 'Insecticide'
    },
    'feed_breakdown': {
        group: 'Unknown'
    },
    'econ_farm': {
        group: 'Production Costs'
    },
    'econ_field': {
        group: 'Production Costs'
    },
}

var chartColorsAS = [
    {trans:'rgba(68, 119, 170,.2)',opa:'rgb(68, 119, 170)'}  ,
    {trans:'rgba(0, 119, 187,.2)',opa:'rgb(0, 119, 187)'},
    {trans:'rgba(51, 187, 238,.2)',opa:'rgb(51, 187, 238)'},
    {trans:'rgba(102, 204, 238,.2)',opa:'rgb(102, 204, 238)'},
    {trans:'rgba(25, 136, 255,.2)',opa:'rgb(25, 136, 255)'},
    {trans:'rgba(2, 101, 207,.2)',opa:'rgb(2, 101, 207)'},
    {trans:'rgba(51, 109, 255,.2)',opa:'rgb(51, 109, 255)'}
]

var chartColors = [
    {trans:'rgba(200, 200, 200,.2)',opa:'rgb(200, 200, 200)'},
    {trans:'rgba(190, 190, 190,.2)',opa:'rgb(190, 190, 190)'},
    {trans:'rgba(180, 180, 180,.2)',opa:'rgb(180, 180, 180)'},
    {trans:'rgba(170, 170, 170,.2)',opa:'rgb(170, 170, 170)'},
    {trans:'rgba(160, 160, 160,.2)',opa:'rgb(160, 160, 160)'},
    {trans:'rgba(150, 150, 150,.2)',opa:'rgb(150, 150, 150)'},
    {trans:'rgba(140, 140, 140,.2)',opa:'rgb(140, 140, 140)'},
    {trans:'rgba(130, 130, 130,.2)',opa:'rgb(130, 130, 130)'},
]
// stores references to each chart object. Stores ChartNodes which store the actual chart object and stores the data for each chart
var chartObj = {}
//controls order of how datasets are displayed and with what colors
var chartDatasetContainer = {}
//https://personal.sron.nl/~pault/

var checkBoxScen = []
var checkBoxField = []
var hiddenData = {
    fields:[],
    scens:[],
}
var scenariosStore = Ext.create('Ext.data.Store', {
    fields: ['name','dbID'],
    data : []
});

DSS.utils.addStyle('.sub-container {background-color: rgba(180,180,160,0.1); border-radius: 8px; border: 1px solid rgba(0,0,0,0.2); margin: 4px}')

//------------------------------------------------------------------------------
var dashBoardDialog = Ext.define('DSS.results.Dashboard', {
//------------------------------------------------------------------------------
	extend: 'Ext.window.Window',
	alias: 'widget.state_perimeter_dialog',
    requires: [
		'DSS.map.LayerMenu',
        'DSS.map.OutputMenu',
        'DSS.Field_Summary_Table'
	],
    name: "dashboardWindow",
	alternateClassName: 'DSS.Dashboard',
    id: "dashboardWindow",
    closeAction: 'method-hide',
	constrain: true,
	modal: false,
	width: '80%',
    height: '80%',
	resizable: true,
    maximizable:true,
    minimizable:true,
	titleAlign: 'center',
	layout : 'fit',
	plain: true,
	title: 'Model Results',
	runModel: true,
    scope: this,
    closable: true,
    listeners:{
        enable: function(){
            console.log("ENABLE")
        },
        afterrender: function(){
            console.log("afterrender")
        },
        added: function(){
            console.log("ADDED")
        },
        add: function(){
            console.log("ADD")
        },
        beforehide: function(){
            console.log("beforehide")
            turnOffMappedResults()
        },
        hide: function(){
            console.log("hide")
            turnOffMappedResults()
        },
        beforeclose: function(){
            console.log("beforeclose")
            turnOffMappedResults()
        },
        close: function(){
            console.log("close")
            turnOffMappedResults()
        },
        closeaction: function(window){
            console.log("closeAction")
            turnOffMappedResults()
        },
        beforeclose: function(window){
            console.log("beforeclose")
            turnOffMappedResults()
        },
        minimize: function (window, opts) {
            console.log("minimize")
            window.collapse();
            window.setWidth(150);
            window.setHeight(150)
        },
        activate: function(window){
            console.log("activate")
        },
    },
    tools: [{
        type: 'restore',
        handler: function (evt, toolEl, owner, tool) {
            console.log("restore")
            var window = owner.up('window');
            window.setWidth(300);
            window.setHeight(300);
        }
     },
],


	config: {
        // ...
        /**
         * Here's how you document a config option.
         *
         * @cfg {Integer} [numberOfLines=8]
         */
        numberOfLines: 8, // default value of 8

//        ChartData:  {
//                    //          labels: ["Fields","happy"],
//                                datasets: []
//                            },
    },

	//--------------------------------------------------------------------------
	initComponent: function() {

	    console.log("Opening dialog")
        let chart_height = '25vh'
        let chart_width = '32vw'

        let chart_height_single = '50vh'
        let chart_width_single = '58vw'

        let chart_height_double = '50vh'
        let chart_width_double = '58vw'

		let me = this;
		layer = DSS.layer.fields_1
        
        if (this.runModel) {
            var modelruntime = ''
            //assign model run timestamp
            modelruntimeOrig = String(new Date().valueOf())
			console.log(modelruntime)
            //modelruntimeOrig = modelruntime
            fieldChangeList = fieldChangeList.flat()
            chartDatasetContainer = new ChartDatasetContainer()
            compCheckBoxes = compareChartCheckBox()
//            get progress bars

//            need just a slight delay
            setTimeout(() => {
                yield_pb = document.getElementById("yield_pb");
                nut_pb = document.getElementById("nut_pb");
                ero_pb = document.getElementById("ero_pb");
                bio_pb = document.getElementById("bio_pb");
                runoff_pb = document.getElementById("runoff_pb");
                econ_pb = document.getElementById("econ_pb");
                nleaching_pb = document.getElementById("nleaching_pb");

                // show progress bars when models run
                econ_pb.hidden = false
                ero_pb.hidden = false
                bio_pb.hidden = false
                runoff_pb.hidden = false
                yield_pb.hidden = false
                nut_pb.hidden = false
                //nleaching_pb.hidden = false
                Ext.getCmp("erosionFarmConvert").setDisabled(true)
                Ext.getCmp("erosionFieldConvert").setDisabled(true)
                Ext.getCmp("yieldFarmConvert").setDisabled(true)
                Ext.getCmp("yieldFieldConvert").setDisabled(true)
                Ext.getCmp("econFarmConvert").setDisabled(true)
                Ext.getCmp("econFieldConvert").setDisabled(true)
                Ext.getCmp("nutrientsFarmConvert").setDisabled(true)
                Ext.getCmp("nutrientsFieldConvert").setDisabled(true)
                //Ext.getCmp("nitrateFarmConvert").setDisabled(true)
                //Ext.getCmp("nitrateFieldConvert").setDisabled(true)
                Ext.getCmp('mainTab').update()
            }, 10);
            createDashBoard(me)
        }
        //create dashboard model runs
        async function createDashBoard(dashboard){
            pmanureReturn_array = []
            layerList = []
            await layer.getSource().forEachFeature(function(f) {
                layerList.push(f)
            })
            let fieldIter = await retrieveAllFieldsDataGeoserver()
            fieldIter = await fieldIter
            let download = await downloadRasters(fieldIter)
            
            download = await download
            console.log("download done")
            console.log("running model")
            

            numbFields = fieldIter.length
            totalFields = numbFields * modelTypes.length
            for (model in modelTypes){
                 switch (modelTypes[model]){
                    case 'yield':
                        yield_pb.max = numbFields
                        nut_pb.max = numbFields
                        ero_pb.max = numbFields
                        break
                    case 'ploss':
                         nut_pb.max = numbFields
                         ero_pb.max = numbFields
                        break
                    case 'runoff':
                        runoff_pb.max = numbFields
                        break
                    case 'Feedoutput':
                        runoff_pb.max = numbFields
                        break
                    case 'bio':
                        bio_pb.max = numbFields
                        break
                    case 'econ':
                        econ_pb.max = numbFields
                        break
                    case 'nitrate':
                        //set up a call to a python function to run the nitrate model.  we'll worry about
                        //presentation after the model works.
                        nleaching_pb.max = numbFields
                        break
                }
            }
            console.log(fieldIter)
            
//          get parameters for the active scenario fields from the layer display
//          if fields arent in the active scenario then use the values from the database
//          we have to do it this because the inactive layers don't store the geographic properities that are needed to calculate area and extents for running the models
//          while the inactive fields are just retrieving their models results from the db
            for(item in fieldIter){
                f = fieldIter[item]
                console.log(f)
                if(f.properties.is_dirty == true){
                    //f.properties.model_time_stamp = modelruntimeOrig
                    console.log(f)
                    DSS.layer.fields_1.getSource().forEachFeature(function(x) {
                        if(x.values_.gid == f.properties.gid){
                            x.setProperties({model_time_stamp : modelruntimeOrig})
                            wfs_update(x,'field_2');
                        }
                    })
                }

//              for each layer run each model type: yield (grass or crop), ero, pl
                for (model in modelTypes){
                    let model_request_return = await build_model_request(f.properties, f, modelTypes[model],modelruntime,DSS.activeScenario,[])
                    console.log(model_request_return)
                    get_model_data(model_request_return).then(returnData =>{
                        console.log("RETURN DATA HERE!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
                        console.log(returnData[0])
                        console.log(f)
                        console.log(f.properties.is_dirty)
                        //console.log(returnData[0].model_run_timestamp)
                        console.log(DSS.activeScenario.toString())
                        if(f.properties.is_dirty == false && returnData[0].model_type == 'ploss' && returnData[0].model_run_timestamp != modelruntimeOrig && returnData[0].scen_id == DSS.activeScenario.toString()){
                            modelruntime = returnData[0].model_run_timestamp
                            console.log("MODELRUNTIME CHANGED TO OLD VALUE");
                            //console.log(returnData[0])
                            console.log(modelruntime);
                        }
                        //modelruntime = returnData[0].model_run_timestamp
//                      no model results with that particular field
                        switch (returnData[0].model_type){
                            case 'yield':
                                yield_pb.value = yield_pb.value + 1
                                if(yield_pb.value==yield_pb.max){
                                    yield_pb.hidden = true
                                    Ext.getCmp("yieldTab").setDisabled(false)
                                    Ext.getCmp("yieldFarmConvert").setDisabled(false)
                                    Ext.getCmp("yieldFieldConvert").setDisabled(false)
                                    ero_pb.hidden = true
                                    Ext.getCmp("eroTab").setDisabled(false)
                                    Ext.getCmp("erosionFarmConvert").setDisabled(false)
                                    Ext.getCmp("erosionFieldConvert").setDisabled(false)
                                    nut_pb.hidden = true
                                    Ext.getCmp("nutrientsFarmConvert").setDisabled(false)
                                    Ext.getCmp("nutrientsFieldConvert").setDisabled(false)
                                    Ext.getCmp("nutTab").setDisabled(false)
                                    runoff_pb.hidden =true
                                    Ext.getCmp("runoffTab").setDisabled(false)
                                    bio_pb.hidden = true
                                    Ext.getCmp("bioTab").setDisabled(false)
                                     econ_pb.hidden = true
                                    Ext.getCmp("econTab").setDisabled(false)
                                    Ext.getCmp("econFarmConvert").setDisabled(false)
                                    Ext.getCmp("econFieldConvert").setDisabled(false)
                                    console.log("LOOK FOR CHARTOBJ!!!%^%^%&^*&^*%^&*^&*%*&%&^%^&%*&^&^(*^&*%*^%^*^&*^*&%^&%^^&*^&(^*^%^&%&*^&*^&*%&^$^&%&*^")
                                    console.log(chartObj)
                                    let scenIndexAS = chartDatasetContainer.indexScenario(DSS.activeScenario)
                                    console.log(scenIndexAS)
                                    //At the end of model runs this sets the summary table as the active tab, so that its the first thing the user sees.
                                    setTimeout(function(){
                                        Ext.getCmp('mainTab').setActiveTab(summaryTable)
                                    }, 500);

                                }
                                break
                            case 'ploss':
                                nut_pb.value = nut_pb.value + 1
                                if(nut_pb.value==nut_pb.max){
                                    nut_pb.hidden = true
                                    Ext.getCmp("nutrientsFarmConvert").setDisabled(false)
                                    Ext.getCmp("nutrientsFieldConvert").setDisabled(false)
                                    Ext.getCmp("nutTab").setDisabled(false)
                                }
                                ero_pb.value = ero_pb.value + 1
                                if(ero_pb.value==ero_pb.max){
                                    ero_pb.hidden = true
                                    Ext.getCmp("eroTab").setDisabled(false)
                                    Ext.getCmp("erosionFarmConvert").setDisabled(false)
                                    Ext.getCmp("erosionFieldConvert").setDisabled(false)
                                }
                                break
                            case 'runoff':
                                runoff_pb.value = runoff_pb.value + 1
                                if(runoff_pb.value == runoff_pb.max){
                                    runoff_pb.hidden =true
                                    Ext.getCmp("runoffTab").setDisabled(false)
                                }
                                break
                            case 'bio':
                                bio_pb.value = bio_pb.value + 1
                                if(bio_pb.value == bio_pb.max){
                                    bio_pb.hidden = true
                                    Ext.getCmp("bioTab").setDisabled(false)
                                }
                                break
                            case 'econ':
                                econ_pb.value = econ_pb.value + 1
                                if(econ_pb.value == econ_pb.max){
                                    econ_pb.hidden = true
                                    Ext.getCmp("econTab").setDisabled(false)
                                    Ext.getCmp("econFarmConvert").setDisabled(false)
                                    Ext.getCmp("econFieldConvert").setDisabled(false)
                                }
                                break

                        }
                        totalFields = totalFields - 1
                        if(totalFields == 0){
                            Ext.getCmp("btnRunModels").setDisabled(false)
                            Ext.getCmp("compareTab").setDisabled(false)
                            Ext.getCmp("compareTabBtn").setDisabled(false)
                            console.log(f)
                            if(document.getElementById("modelSpinner") != null){
                              document.getElementById("modelSpinner").style.display = "none";
                            }
                            delete $.ajaxSetup().headers
                            Ext.ComponentQuery.query('tabpanel[name="mappedResultsTab"]')[0].setDisabled(false)
                        }
                        Ext.getCmp('mainTab').update()
                    })
                   // })
                }
            }
            //Need to activate here since we will not have the manure P results back for all fields until now.
            //Ext.getCmp('mainTab').setActiveTab(summaryTable)
            //console.log(Ext.getCmp('SummaryTable').getY)
            //Ext.getCmp('SummaryTable').active(true)
            
            //me.setActiveTab(Ext.getCmp('SummaryTable'))
        }
//      put new tabs here
//TODO update
        var infrastructure = {

                title: '<i class="fas fa-wrench"></i>  Infrastructure <br/>',
                plain: true,
                disabled:true,

                tabConfig:{
                    tooltip: "Infrastructure",
//                    cls: "myBar"
                },
                tabBar : {
                    layout: {
                        pack: 'center',
                            //background: '#C81820',
                     }
                 },
                xtype: 'tabpanel',
                style: 'background-color: #377338;',

                defaults: {
                   border:false,
                    bodyBorder: false
                },
                scrollable: true,

//                inner tabs for farm and field scale
                items:[{
                    xtype: 'container',
                    title: '<i class="fas fa-warehouse"></i>  Farm',
                    border: false,
                    layout: {
                        type: 'table',
                        // The total column count must be specified here
                        columns: 2
                    },
                    defaults: {

                    style: 'padding:10px; ',
                    border:0,
                },
                    items:[{
                        xtype: 'container',
                        html: '<div id="container" ><canvas id="cost_farm" style = "width:'+chart_width+';height:'+chart_height+';"></canvas></div>',
                    },{
                        xtype: 'container',
                        html: '<div id="container"><canvas  id="net_return_farm" style = "width:'+chart_width+';height:'+chart_height+';"></canvas></div>',
                    },{
                        xtype: 'container',
                    },{
                        xtype: 'container',
//                        html: '<div id="container"><canvas  id="milk_farm" style = "width:'+chart_width+';height:'+chart_height+';"></canvas></div>',
                    }],
                    scope: this,
                    listeners:{activate: function() {
                        console.log("activated farm")
//                      Add grid here for the cost
//                          if (chartObj["cost_farm"].chart !== null){
//                            chartObj["cost_farm"].chart.destroy()
//                            chartObj["net_return_farm"].chart.destroy()
//                        }

                    }}

                },
//                { xtype: 'panel',
//                    title: '<i class="fas fa-seedling"></i></i>  Field',
//                    border: false,
//                    layout: {
//                        type: 'table',
//                        // The total column count must be specified here
//                        columns: 2
//                    },
//                    defaults: {
//
//                        style: 'padding:10px; ',
//                        border:0,
//                    },
//                    items:[{
//                        xtype: 'container',
//                        html: '<div id="container" ><canvas id="cost_field" style = "width:'+chart_width+';height:'+chart_height+';"></canvas></div>',
//                    },{
//                        xtype: 'container',
//                        html: '<div id="container"><canvas  id="net_return_field" style = "width:'+chart_width+';height:'+chart_height+';"></canvas></div>',
//                    },{
//                        xtype: 'container',
//                    },{
//                        xtype: 'container',
////                        html: '<div id="container"><canvas  id="milk_field" style = "width:'+chart_width+';height:'+chart_height+';"></canvas></div>',
//                    }],
//                    listeners:{activate: function() {
//                        console.log("activated field")
//                        if (chartObj["cost_field"].chart !== null){
//                            chartObj["cost_field"].chart.destroy()
//                            chartObj["net_return_field"].chart.destroy()
//                        }
////                            create_graph(barChartData, 'test units', 'test title', document.getElementById('milk_field').getContext('2d'));
//                    }}
//                }
                ],

            }
            //TODO update
        var erosion = {

                title: '<i class="fas fa-mountain"></i>  Erosion <br/> <progress class = "progres_bar" hidden = true value="0" max="100" id=ero_pb >50%</progress>',
                //title: '<i class="fas fa-mountain"></i>  Erosion <br/> <progress class = "progres_bar" hidden = true value="0" max="100" id=yield_pb >50%</progress>',
                plain: true,
                id:"eroTab",
                disabled:true,
                tabConfig:{
                    tooltip: "Erosion",
//                    cls: "myBar"
                },
                tabBar : {
                    layout: {
                        pack: 'center',
                            //background: '#C81820',
                     }
                 },
                xtype: 'tabpanel',
                style: 'background-color: #377338;',

                defaults: {
                   border:false,
                    bodyBorder: false
                },
                scrollable: true,

//                inner tabs for farm and field scale
                items:[{ xtype: 'panel',
                    title: '<i class="fas fa-seedling"></i></i>  Field',
                    id: 'eroFieldTab',
//                    disabled: true,
                    border: false,
                    layout: {
                        type: 'table',
                        // The total column count must be specified here
                        columns: 1
                    },
                    defaults: {

                    style: 'padding:10px; ',
                    border:0,
                },
                    items:[{
                        xtype: 'radiogroup',
                        id: 'erosionFieldConvert',
                        vertical: true,
                        columns:2,
                        items: [
                            {
                                boxLabel  : 'Erosion / Area',
                                inputValue: 'a',
                                checked:true
                            }, {
                                boxLabel  : 'Total Erosion',
                                inputValue: 't',
                            },
                        ],
                         listeners:{change: function(e, newValue, oldValue, eOpts) {
                            displayAlternate("soil_loss_field", e.id)
                         }},
                    },
                    {
                        xtype: 'container',
                        html: '<div id="container" ><canvas id="soil_loss_field" style = "width:'+chart_width_double+';height:'+chart_height_double+';"></canvas></div>',
                    },

                    ],
                    listeners:{activate: function() {
                        console.log("activated field")
                        if (chartObj["soil_loss_field"].chart !== null){
                            return
                        }
                        chartObj.soil_loss_field.chart = create_graph(chartObj.soil_loss_field, 'Soil Loss', document.getElementById('soil_loss_field').getContext('2d'));

                    }}
                },{
                    xtype: 'container',
                    title: '<i class="fas fa-warehouse"></i>  Farm',
                    border: false,
                    layout: {
                        type: 'table',
                        // The total column count must be specified here
                        columns: 1
                    },
                    defaults: {

                    style: 'padding:10px; ',
                    border:0,
                },
                    items:[{
                        xtype: 'radiogroup',
                        id: 'erosionFarmConvert',
                        vertical: true,
                        columns:2,
                        items: [
                            {
                                boxLabel  : 'Erosion / Area',
                                inputValue: 'a',
                                checked:true
                            }, {
                                boxLabel  : 'Total Erosion',
                                inputValue: 't',
                            },
                        ],
                         listeners:{change: function(e, newValue, oldValue, eOpts) {
                            displayAlternate("soil_loss_farm", e.id)
                         }},
                    },
                    {
                        xtype: 'container',
                        html: '<div id="container" ><canvas id="soil_loss_farm" style = "width:'+chart_width_double+';height:'+chart_height_double+';"></canvas></div>',
                    },
//                    {
//                        xtype: 'container',
//                        html: '<div id="container"><canvas  id="net_return_farm" style = "width:'+chart_width+';height:'+chart_height+';"></canvas></div>',
//                    },{
//                        xtype: 'container',
//                    },{
//                        xtype: 'container',
////                        html: '<div id="container"><canvas  id="milk_farm" style = "width:'+chart_width+';height:'+chart_height+';"></canvas></div>',
//                    }
                    ],
                    scope: this,
                    listeners:{activate: function() {
                        console.log("activated farm")
                          if (chartObj["soil_loss_farm"].chart !== null){
                            return
                        }
                      chartObj.soil_loss_farm.chart = create_graph(chartObj.soil_loss_farm, 'Soil Loss', document.getElementById('soil_loss_farm').getContext('2d'));


                    }}

                }],

            }
            //TODO update
        var yield = {
                title: '<i class="fab fa-pagelines"></i>  Yield <br/> <progress class = "progres_bar" hidden = true value="0" max="100" id=yield_pb >50%</progress>',
                plain: true,
                id:"yieldTab",
                disabled:true,
                tabConfig:{
                    tooltip: "Crop Yield",
//                    cls: "myBar"
                },
                tabBar : {
                    layout: {
                        pack: 'center',
                            //background: '#C81820',
                     }
                 },
                xtype: 'tabpanel',
                style: 'background-color: #377338;',

                defaults: {
                   border:false,
                    bodyBorder: false
                },
                scrollable: true,

//                inner tabs for farm and field scale
                items:[
                    //-------------------------Yield Field Tab-------------------------------------
                { xtype: 'panel',
                title: '<i class="fas fa-seedling"></i></i>  Field',
                border: false,
                id: 'yieldFieldTab',
//                    disabled: true,
                                scrollable: true,

                layout: {
                    type: 'table',
                    // The total column count must be specified here
                    columns: 1
                },
                defaults: {

                style: 'padding:10px; ',
                border:0,
            },
                items:[
                    {
                    xtype: 'button',
                    cls: 'button-text-pad',
                    componentCls: 'button-margin',
                    text: 'Manually Adjust Yields',
                    handler: async function(self) {
                        console.log(chartObj)
                        console.log(fieldYieldArray)
                        await gatherYieldTableData()
                        
                        Ext.destroy('DSS.results.YieldAdjustment'); 
                        DSS.dialogs.YieldAdjustment = Ext.create('DSS.results.YieldAdjustment'); 
                        DSS.dialogs.YieldAdjustment.setViewModel(DSS.viewModel.scenario);		
                        
                        DSS.dialogs.YieldAdjustment.show().center().setY(0);
                    }
                },
                {
                    xtype: 'radiogroup',
                    id: 'yieldFieldConvert',
                    vertical: true,
                    columns:2,
                    items: [
                        {
                            boxLabel  : 'Yield  ',
                            inputValue: 'a',
                            checked:true
                        }, {
                            boxLabel  : 'Production',
                            inputValue: 't',
                        },
                    ],
                     listeners:{change: function(e, newValue, oldValue, eOpts) {
                        console.log("yield alternate pushed")
                        displayAlternate("grass_yield_field", e.id)
                        displayAlternate("corn_yield_field", e.id)
                        displayAlternate("corn_silage_yield_field", e.id)
                        displayAlternate("soy_yield_field", e.id)
                        displayAlternate("oat_yield_field", e.id)
                        displayAlternate("alfalfa_yield_field", e.id)
                        displayAlternate("rotation_yield_field", e.id)
                     }},
                },
                //---------------------------------------------------------------------------------------------------- 
                {
                    xtype: 'container',
                    html: '<div id="container"><canvas  id="rotation_yield_field" style = "width:'+chart_width_double+';height:'+chart_height_double+';"></canvas></div>',
                },{
                    xtype: 'container',
                    html: '<div id="container" ><canvas id="grass_yield_field" style = "width:'+chart_width_double+';height:'+chart_height_double+';"></canvas></div>',
                },{
                    xtype: 'container',
                    html: '<div id="container"><canvas  id="corn_yield_field" style = "width:'+chart_width_double+';height:'+chart_height_double+';"></canvas></div>',
                },{
                    xtype: 'container',
                    html: '<div id="container"><canvas  id="corn_silage_yield_field" style = "width:'+chart_width_double+';height:'+chart_height_double+';"></canvas></div>',
                },{
                    xtype: 'container',
                    html: '<div id="container"><canvas  id="soy_yield_field" style = "width:'+chart_width_double+';height:'+chart_height_double+';"></canvas></div>',
                },{
                    xtype: 'container',
                    html: '<div id="container"><canvas  id="oat_yield_field" style = "width:'+chart_width_double+';height:'+chart_height_double+';"></canvas></div>',
                },{
                    xtype: 'container',
                    html: '<div id="container"><canvas  id="alfalfa_yield_field" style = "width:'+chart_width_double+';height:'+chart_height_double+';"></canvas></div>',
                },
                ],
                listeners:{activate: function() {
                    console.log("activated field")
                    if(!chartObj.grass_yield_field.show){document.getElementById('grass_yield_field').style.display="none"};
                    if(!chartObj.corn_yield_field.show){document.getElementById('corn_yield_field').style.display="none"}
                    if(!chartObj.corn_silage_yield_field.show){document.getElementById('corn_silage_yield_field').style.display="none"}
                    if(!chartObj.soy_yield_field.show){document.getElementById('soy_yield_field').style.display="none"}
                    if(!chartObj.oat_yield_field.show){document.getElementById('oat_yield_field').style.display="none"}
                    if(!chartObj.alfalfa_yield_field.show){document.getElementById('alfalfa_yield_field').style.display="none"}
                    if(!chartObj.rotation_yield_field.show){document.getElementById('rotation_yield_field').style.display="none"}
                    if (chartObj["grass_yield_field"].chart !== null){
                        return
                    }
                    chartObj.grass_yield_field.chart = create_graph(chartObj.grass_yield_field, 'Grass Yield', document.getElementById('grass_yield_field').getContext('2d'));
                    chartObj.corn_yield_field.chart = create_graph(chartObj.corn_yield_field, 'Corn Yield', document.getElementById('corn_yield_field').getContext('2d'));
                    chartObj.corn_silage_yield_field.chart = create_graph(chartObj.corn_silage_yield_field, 'Corn Silage', document.getElementById('corn_silage_yield_field').getContext('2d'));
                    chartObj.soy_yield_field.chart = create_graph(chartObj.soy_yield_field, 'Soy Yield', document.getElementById('soy_yield_field').getContext('2d'));
                    chartObj.oat_yield_field.chart = create_graph(chartObj.oat_yield_field, 'Oat Yield', document.getElementById('oat_yield_field').getContext('2d'));
                    chartObj.alfalfa_yield_field.chart = create_graph(chartObj.alfalfa_yield_field, 'Alfalfa Yield', document.getElementById('alfalfa_yield_field').getContext('2d'));
                    chartObj.rotation_yield_field.chart = create_graph(chartObj.rotation_yield_field, 'Total Yield', document.getElementById('rotation_yield_field').getContext('2d'));
                },
            }
        },
        {
                    xtype: 'container',
                    title: '<i class="fas fa-warehouse"></i>  Farm',
                    border: false,
                    layout: {
                        type: 'table',
                        // The total column count must be specified here
                        columns: 1
                    },
                    defaults: {

                        style: 'padding:10px; ',
                        border:0,
                    },
                    items:[
                    {
                        xtype: 'radiogroup',
                        id: 'yieldFarmConvert',
                        vertical: true,
                        columns:2,
                        items: [
                            {
                                boxLabel  : 'Yield',
                                inputValue: 'a',
                                checked:true
                            }, {
                                boxLabel  : 'Production',
                                inputValue: 't',
                            },
                        ],
                         listeners:{change: function(e, newValue, oldValue, eOpts) {
                            displayAlternate("grass_yield_farm", e.id)
                            displayAlternate("corn_yield_farm", e.id)
                            displayAlternate("corn_silage_yield_farm", e.id)
                            displayAlternate("soy_yield_farm", e.id)
                            displayAlternate("oat_yield_farm", e.id)
                            displayAlternate("alfalfa_yield_farm", e.id)
                            displayAlternate("rotation_yield_farm", e.id)
                            console.log(chartObj)
                         }},
                    },
//                    {
//
//                        xtype: 'container',
//                    },
                    {
                        xtype: 'container',
                        html: '<div id="container"><canvas  id="rotation_yield_farm" style = "width:'+chart_width_double+';height:'+chart_height_double+';"></canvas></div>',
                    },{
                        xtype: 'container',
                        html: '<div id="container" ><canvas id="grass_yield_farm" style = "width:'+chart_width_double+';height:'+chart_height_double+';"></canvas></div>',
                    },{
                        xtype: 'container',
                        html: '<div id="container"><canvas  id="corn_yield_farm" style = "width:'+chart_width_double+';height:'+chart_height_double+';"></canvas></div>',
                    },{
                        xtype: 'container',
                        html: '<div id="container"><canvas  id="corn_silage_yield_farm" style = "width:'+chart_width_double+';height:'+chart_height_double+';"></canvas></div>',
                    },{
                        xtype: 'container',
                        html: '<div id="container"><canvas  id="soy_yield_farm" style = "width:'+chart_width_double+';height:'+chart_height_double+';"></canvas></div>',
                    },{
                        xtype: 'container',
                        html: '<div id="container"><canvas  id="oat_yield_farm" style = "width:'+chart_width_double+';height:'+chart_height_double+';"></canvas></div>',
                    },{
                        xtype: 'container',
                        html: '<div id="container"><canvas  id="alfalfa_yield_farm" style = "width:'+chart_width_double+';height:'+chart_height_double+';"></canvas></div>',
                    },
                    ],
                    scope: this,
                    listeners:{activate: async function() {
                        console.log("activated farm")
                        if(!chartObj.grass_yield_farm.show){document.getElementById('grass_yield_farm').style.display="none"};
                        if(!chartObj.corn_yield_farm.show){document.getElementById('corn_yield_farm').style.display="none"}
                        if(!chartObj.corn_silage_yield_farm.show){document.getElementById('corn_silage_yield_farm').style.display="none"}
                        if(!chartObj.soy_yield_farm.show){document.getElementById('soy_yield_farm').style.display="none"}
                        if(!chartObj.oat_yield_farm.show){document.getElementById('oat_yield_farm').style.display="none"}
                        if(!chartObj.alfalfa_yield_farm.show){document.getElementById('alfalfa_yield_farm').style.display="none"}
                        if(!chartObj.rotation_yield_farm.show){document.getElementById('rotation_yield_farm').style.display="none"}

                         if (chartObj["rotation_yield_farm"].chart !== null){
                         return
                        }
                        //------------------------------------
                        //This bit of code is used to clean up datasets in order to ensure they will chart
                        var farmYeildChartArray = [chartObj.grass_yield_farm,chartObj.corn_yield_farm,chartObj.corn_silage_yield_farm,
                            chartObj.soy_yield_farm,chartObj.oat_yield_farm,chartObj.alfalfa_yield_farm,chartObj.rotation_yield_farm]
                        for (chart in farmYeildChartArray){
                            console.log(farmYeildChartArray[chart])
                            if(chart == "grass_yield_farm"||"corn_yield_farm"||"corn_silage_yield_farm"||"soy_yield_farm"||"oat_yield_farm"||"alfalfa_yield_farm"||"rotation_yield_farm")
                            {
                                console.log("Yield Chart Hit")
                                for(i in farmYeildChartArray[chart].chartData.datasets){
                                    console.log(farmYeildChartArray[chart].chartData.datasets[i].data)
                                    if(farmYeildChartArray[chart].chartData.datasets[i].data.length > 2){
                                        farmYeildChartArray[chart].chartData.datasets[i].data = [null,null];
                                        console.log("found bad chart input")
                                    }
                                }
                            }
                        }
                        //--------------------------------------------
                        chartObj.grass_yield_farm.chart = create_graph(chartObj.grass_yield_farm, 'Grass Yield', document.getElementById('grass_yield_farm').getContext('2d'));
                        chartObj.corn_yield_farm.chart = create_graph(chartObj.corn_yield_farm, 'Corn Grain Yield', document.getElementById('corn_yield_farm').getContext('2d'));
                        chartObj.corn_silage_yield_farm.chart = create_graph(chartObj.corn_silage_yield_farm, 'Corn Silage Yield', document.getElementById('corn_silage_yield_farm').getContext('2d'));
                        chartObj.soy_yield_farm.chart = create_graph(chartObj.soy_yield_farm, 'Soy Yield', document.getElementById('soy_yield_farm').getContext('2d'));
                        chartObj.oat_yield_farm.chart = create_graph(chartObj.oat_yield_farm, 'Oat Yield', document.getElementById('oat_yield_farm').getContext('2d'));
                        chartObj.alfalfa_yield_farm.chart = create_graph(chartObj.alfalfa_yield_farm, 'Alfalfa Yield', document.getElementById('alfalfa_yield_farm').getContext('2d'));
                        chartObj.rotation_yield_farm.chart = create_graph(chartObj.rotation_yield_farm, 'Total Yield', document.getElementById('rotation_yield_farm').getContext('2d'));
                        // await chartObj.grass_yield_farm.chart.update()
						// await chartObj.corn_yield_farm.chart.update()
						// await chartObj.corn_silage_yield_farm.chart.update()
						// await chartObj.soy_yield_farm.chart.update()
						// await chartObj.oat_yield_farm.chart.update()
						// await chartObj.alfalfa_yield_farm.chart.update()
						// await chartObj.rotation_yield_farm.chart.update()
                    }
                }
                },
                
        ],
        }
            //TODO update
        var economics = {

                title: '<i class="fa fa-money fa-lg"></i> Production Costs <br/> <progress class = "progres_bar" hidden = true value="0" max="100" id=econ_pb >50%</progress>',
                plain: true,
                id: "econTab",
                disabled:true,
                tabConfig:{
                    tooltip: "Economics",
//                    cls: "myBar"
                },
                tabBar : {
                    layout: {
                        pack: 'center',
                            //background: '#C81820',
                     }
                 },
                xtype: 'tabpanel',
                style: 'background-color: #377338;',

                defaults: {
                   border:false,
                    bodyBorder: false
                },
                scrollable: true,

//                inner tabs for farm and field scale
                items:[{ xtype: 'panel',
                title: '<i class="fas fa-seedling"></i></i>  Field',
                id: 'econFieldTab',
                border: false,
                layout: {
                    type: 'table',
                    // The total column count must be specified here
                    columns: 1
                },
                defaults: {

                style: 'padding:10px; ',
                border:0,
            },
                items:[{
                        xtype: 'radiogroup',
                        id: 'econFieldConvert',
                        vertical: true,
                        columns:3,
                        items: [
                            {
                                boxLabel  : 'Cost / ac',
                                inputValue: 'a',
                                checked:true
                            },
                            {
                                boxLabel  : 'Total Cost',
                                inputValue: 't',
                            },
                            {
                                boxLabel  : 'Cost/Ton-DM',
                                inputValue: 'd',
                            },
                        ],
                         listeners:{change: function(e, newValue, oldValue,   eOpts) {
                            displayAlternateEcon("econ_field", oldValue.econFieldConvert,newValue.econFieldConvert)
                        }},
                    },
                    {
                    xtype: 'container',
                        html: '<div id="container" ><canvas id="econ_field" style = "width:'+chart_width_double+';height:'+chart_height_double+';"></canvas></div>',
                    },
//                 {
//                     xtype: 'container',
// //                        html: '<div id="container"><canvas  id="net_return_field" style = "width:'+chart_width+';height:'+chart_height+';"></canvas></div>',
//                 },
//                 {
//                     xtype: 'container',
//                 },
//                 {
//                     xtype: 'container',
// //                        html: '<div id="container"><canvas  id="milk_field" style = "width:'+chart_width+';height:'+chart_height+';"></canvas></div>',
//                 }
            ],
                listeners:{activate: function() {
                       console.log("activated field")
                       if (chartObj["econ_field"].chart !== null){
                           return
//                            chartObj["econ_field"].chart.destroy()
//                            chartObj["net_return_field"].chart.destroy()
                       }
                       chartObj.econ_field.chart = create_graph(chartObj.econ_field, 'Costs', document.getElementById('econ_field').getContext('2d'));
//                        chartObj.net_return_field.chart = create_graph(chartObj.net_return_field, 'test title', document.getElementById('net_return_field').getContext('2d'));
//                            create_graph(barChartData, 'test units', 'test title', document.getElementById('milk_field').getContext('2d'));
                    }
                }
            },{
                    xtype: 'container',
                    title: '<i class="fas fa-warehouse"></i>  Farm',
                    border: false,
                    layout: {
                        type: 'table',
                        // The total column count must be specified here
                        columns: 1
                    },
                    defaults: {
                    style: 'padding:10px; ',
                    border:0,
                },
                    items:[{
                        xtype: 'radiogroup',
                        id: 'econFarmConvert',
                        vertical: true,
                        columns:3,
                        items: [
                            {
                                boxLabel  : 'Cost / Acre',
                                inputValue: 'a',
                                checked:true
                            },
                            {
                                boxLabel  : 'Total Cost',
                                inputValue: 't',
                            },
                            {
                                boxLabel  : 'Cost/Ton DM',
                                inputValue: 'd',
                            },
                        ],
                         listeners:{change: function(e, newValue, oldValue,   eOpts) {
                            displayAlternateEcon("econ_farm", oldValue.econFarmConvert,newValue.econFarmConvert)
                        }},
                    },
                    {
                        xtype: 'container',
                        html: '<div id="container" ><canvas id="econ_farm" style = "width:'+chart_width_double+';height:'+chart_height_double+';"></canvas></div>',
                    },
                    // {
                    //     xtype: 'container',
                    //     html: '<div id="container"><canvas  id="net_return_farm" style = "width:'+chart_width+';height:'+chart_height+';"></canvas></div>',
                    // },
                    // {
                    //     xtype: 'container',
                    // },{
                    //     xtype: 'container',
                    //     html: '<div id="container"><canvas  id="milk_farm" style = "width:'+chart_width+';height:'+chart_height+';"></canvas></div>',
                    // }
                ],
                    scope: this,
                    listeners:{activate: function() {
                       console.log("activated farm")
                         if (chartObj["econ_farm"].chart !== null){
                           return
//                            chartObj["econ_farm"].chart.destroy()
//                            chartObj["net_return_farm"].chart.destroy()
                       }
                       chartObj.econ_farm.chart = create_graph(chartObj.econ_farm, 'Costs', document.getElementById('econ_farm').getContext('2d'));
                       //chartObj.net_return_farm.chart = create_graph(chartObj.econ_farm, 'Net Return per Acre', document.getElementById('net_return_farm').getContext('2d'));
                      // create_graph(barChartData, 'test units', 'test title', document.getElementById('milk_farm').getContext('2d'));

                    }}

                },
                
            ],

            }
            //TODO update
            var nitrate = {
                title: '<i class="fas fa-hand-holding-water"></i>  Nitrate <br/> <progress class = "progres_bar" hidden = true value="0" max="100" id=nleaching_pb >50%</progress>',
                plain: true,
                id:"nitrateTab",
                disabled:true,
                tabBar : {
                    layout: {
                        pack: 'center',
                            //background: '#C81820',
                     }
                 },
                xtype: 'tabpanel',
                style: 'background-color: #377338;',

                defaults: {
                   border:false,
                    bodyBorder: false
                },
                scrollable: true,
//                inner tabs for farm and field scale
                items:[
                    { xtype: 'panel',
                    title: '<i class="fas fa-seedling"></i></i>  Field',
                     border: false,
//                   disabled: true,
                    id: 'nitrateFieldTab',
                    layout: {
                        type: 'table',
                        // The total column count must be specified here
                        columns: 1
                    },
                    defaults: {

                    style: 'padding:10px; ',
                    border:0,
                },
                    items:[{
                        xtype: 'radiogroup',
                        id: 'nitrateFieldConvert',
                        vertical: true,
                        columns:2,
                        items: [
                            {
                                boxLabel  : 'nitrate / Area',
                                inputValue: 'a',
                                checked:true
                            }, {
                                boxLabel  : 'Total nitrate',
                                inputValue: 't',
                            },
                        ],
                         listeners:{change: function(e, newValue, oldValue, eOpts) {
                            displayAlternate("nleaching_field", e.id)
                         }},
                    },
                    {

                        xtype: 'container',
                    },{
                        xtype: 'container',
                        html: '<div id="container" ><canvas id="nleaching_field" style = "width:'+chart_width_double+';height:'+chart_height_double+';"></canvas></div>',
                    },
//                    {
//                        xtype: 'container',
//                        html: '<div id="container"><canvas  id="soil_loss_field" style = "width:'+chart_width_double+';height:'+chart_height_double+';"></canvas></div>',
//                    },
//                    {
//                        xtype: 'container',
//                    },{
//                        xtype: 'container',
//                        html: '<div id="container"><canvas  id="milk_field" style = "width:'+chart_width+';height:'+chart_height+';"></canvas></div>',
//                    }
                    ],
                         listeners:{activate: function() {
                            if (chartObj["nleaching_field"].chart !== null){
//                                chartObj["ploss_field"].chart.destroy()
//                                chartObj["soil_loss_field"].chart.destroy()
                                return
                            }
                            chartObj.nleaching_field.chart = create_graph(chartObj.nleaching_field, 'Nitrate Leaching', document.getElementById('nleaching_field').getContext('2d'));
//                            chartObj.soil_loss_field.chart = create_graph(chartObj.soil_loss_field, 'test units', 'Soil Loss', document.getElementById('soil_loss_field').getContext('2d'));

                    }}
                },
                {
                    xtype: 'container',
                    title: '<i class="fas fa-warehouse"></i>  Farm',
                    border: false,
                    layout: {
                        type: 'table',
                        // The total column count must be specified here
                        columns: 1
                    },
                    defaults: {

                    style: 'padding:10px; ',
                    border:0,
                },
                    items:[{
                        xtype: 'radiogroup',
                        id: 'nitrateFarmConvert',
                        vertical: true,
                        columns:2,
                        items: [
                            {
                                boxLabel  : 'Nutrients / Area',
                                inputValue: 'a',
                                checked:true
                            }, {
                                boxLabel  : 'Total Nutrients',
                                inputValue: 't',
                            },
                        ],
                         listeners:{change: function(e, newValue, oldValue, eOpts) {
                            displayAlternate("ploss_farm", e.id)
                            displayAlternate("ploss_farm", e.id)
                         }},
                    },
                   {
                        xtype: 'container',
                        html: '<div id="container" ><canvas id="ploss_farm" style = "width:'+chart_width_double+';height:'+chart_height_double+';"></canvas></div>',
                    },
//                    {
//                        xtype: 'container',
//                        html: '<div id="container"><canvas  id="soil_loss_farm" style = "width:'+chart_width_double+';height:'+chart_height_double+';"></canvas></div>',
//                    },
//                    {
//                        xtype: 'container',
//                        html: '<div id="container"><canvas  id="canvas2" style = "width:'+chart_width+';height:'+chart_height+';"></canvas></div>',
//                    },{
//
//                        xtype: 'container',
//                        html: '<div id="container"><canvas  id="canvas3" style = "width:'+chart_width+';height:'+chart_height+';"></canvas></div>',
//                    }
                    ],
                        listeners:{activate: function() {
                           if (chartObj["ploss_farm"].chart !== null){
                                return
                            }
                            chartObj.nleaching_farm.chart = create_graph(chartObj.nleaching_field, 'Nitrate Leaching', document.getElementById('nleaching_farm').getContext('2d'));
                    }}

                },
            ],

            }
        var nutrients = {
                title: '<i class="fas fa-hand-holding-water"></i>  Nutrients <br/> <progress class = "progres_bar" hidden = true value="0" max="100" id=nut_pb >50%</progress>',
                //title: '<i class="fas fa-hand-holding-water"></i>  Nutrients <br/> <progress class = "progres_bar" hidden = true value="0" max="100" id=yield_pb >50%</progress>',
                plain: true,
                id:"nutTab",
                disabled:true,
                tabBar : {
                    layout: {
                        pack: 'center',
                            //background: '#C81820',
                     }
                 },
                xtype: 'tabpanel',
                style: 'background-color: #377338;',

                defaults: {
                   border:false,
                    bodyBorder: false
                },
                scrollable: true,
//                inner tabs for farm and field scale
                items:[
                    { xtype: 'panel',
                    title: '<i class="fas fa-seedling"></i></i>  Field',
                     border: false,
//                   disabled: true,
                    id: 'nutFieldTab',
                    scrollable: true,
                    layout: {
                        type: 'table',
                        // The total column count must be specified here
                        columns: 1
                    },
                    defaults: {

                    style: 'padding:10px; ',
                    border:0,
                },
                    items:[{
                        xtype: 'radiogroup',
                        id: 'nutrientsFieldConvert',
                        vertical: true,
                        columns:2,
                        items: [
                            {
                                boxLabel  : 'Nutrients / Area',
                                inputValue: 'a',
                                checked:true
                            }, {
                                boxLabel  : 'Total Nutrients',
                                inputValue: 't',
                            },
                        ],
                         listeners:{change: function(e, newValue, oldValue, eOpts) {
                            displayAlternate("ploss_field", e.id)
                            displayAlternate("nleaching_field", e.id)
                         }},
                    },
                    {

                        xtype: 'container',
                    },{
                        xtype: 'container',
                        html: '<div id="container" ><canvas id="ploss_field" style = "width:'+chart_width_double+';height:'+chart_height_double+';"></canvas></div>',
                    },
                    {
                        xtype: 'container',
                        html: '<div id="container" ><canvas id="nleaching_field" style = "width:'+chart_width_double+';height:'+chart_height_double+';"></canvas></div>',
                    },
//                    {
//                        xtype: 'container',
//                        html: '<div id="container"><canvas  id="soil_loss_field" style = "width:'+chart_width_double+';height:'+chart_height_double+';"></canvas></div>',
//                    },
//                    {
//                        xtype: 'container',
//                    },{
//                        xtype: 'container',
//                        html: '<div id="container"><canvas  id="milk_field" style = "width:'+chart_width+';height:'+chart_height+';"></canvas></div>',
//                    }
                    ],
                         listeners:{activate: function() {
                            if (chartObj["ploss_field"].chart !== null){
//                                chartObj["ploss_field"].chart.destroy()
//                                chartObj["soil_loss_field"].chart.destroy()
                                return
                            }
                            chartObj.ploss_field.chart = create_graph(chartObj.ploss_field, 'Phosphorus Loss', document.getElementById('ploss_field').getContext('2d'));
                            chartObj.nleaching_field.chart = create_graph(chartObj.nleaching_field, 'Nitrate Leaching', document.getElementById('nleaching_field').getContext('2d'));
//                            chartObj.soil_loss_field.chart = create_graph(chartObj.soil_loss_field, 'test units', 'Soil Loss', document.getElementById('soil_loss_field').getContext('2d'));

                    }}
                },
                {
                    xtype: 'container',
                    title: '<i class="fas fa-warehouse"></i>  Farm',
                    border: false,
                    layout: {
                        type: 'table',
                        // The total column count must be specified here
                        columns: 1
                    },
                    defaults: {

                    style: 'padding:10px; ',
                    border:0,
                },
                    items:[{
                        xtype: 'radiogroup',
                        id: 'nutrientsFarmConvert',
                        vertical: true,
                        columns:2,
                        items: [
                            {
                                boxLabel  : 'Nutrients / Area',
                                inputValue: 'a',
                                checked:true
                            }, {
                                boxLabel  : 'Total Nutrients',
                                inputValue: 't',
                            },
                        ],
                         listeners:{change: function(e, newValue, oldValue, eOpts) {
                            displayAlternate("ploss_farm", e.id)
                            displayAlternate("nleaching_farm", e.id)
                         }},
                    },
                   {
                        xtype: 'container',
                        html: '<div id="container" ><canvas id="ploss_farm" style = "width:'+chart_width_double+';height:'+chart_height_double+';"></canvas></div>',
                    },
                    {
                        xtype: 'container',
                        html: '<div id="container" ><canvas id="nleaching_farm" style = "width:'+chart_width_double+';height:'+chart_height_double+';"></canvas></div>',
                    },
//                    {
//                        xtype: 'container',
//                        html: '<div id="container"><canvas  id="soil_loss_farm" style = "width:'+chart_width_double+';height:'+chart_height_double+';"></canvas></div>',
//                    },
//                    {
//                        xtype: 'container',
//                        html: '<div id="container"><canvas  id="canvas2" style = "width:'+chart_width+';height:'+chart_height+';"></canvas></div>',
//                    },{
//
//                        xtype: 'container',
//                        html: '<div id="container"><canvas  id="canvas3" style = "width:'+chart_width+';height:'+chart_height+';"></canvas></div>',
//                    }
                    ],
                        listeners:{activate: function() {
                           if (chartObj["ploss_farm"].chart !== null){
                                return
                            }
                            chartObj.ploss_farm.chart = create_graph(chartObj.ploss_farm, 'Phosphorus Loss', document.getElementById('ploss_farm').getContext('2d'));
                            chartObj.nleaching_farm.chart = create_graph(chartObj.nleaching_farm, 'Nitrate Leaching', document.getElementById('nleaching_farm').getContext('2d'));
                    }}

                },
            ],

            }
            //TODO update

            var feedoutput = {
                title: '<i class="fab fa-pagelines"></i> Feed Breakdown<br/> <progress class = "progres_bar" hidden = true value="0" max="100" id=bio_pb >50%</progress>',
                plain: true,
                id:"feedTab",
                disabled:true,
                tabBar : {
                    layout: {
                        pack: 'center',
                            //background: '#C81820',
                     }
                 },
                xtype: 'tabpanel',
                style: 'background-color: #377338;',

                defaults: {
                   border:false,
                    bodyBorder: false
                },
//                scrollable: true,
//                inner tabs for farm and field scale
                items:[{
                    xtype: 'container',
                    title: '<i class="fas fa-warehouse"></i>  Farm',
                    border: false,
                    layout: {
                        type: 'table',
                        // The total column count must be specified here
                        columns: 1
                    },
                    defaults: {

                    style: 'padding:10px; ',
                    border:0,
//                    html: "hiiiiiiiiii"
                },
                    items:[{
                        xtype: 'container',
                        html: '<div id="container" ><canvas id="feed_breakdown" style = "width:'+chart_width_double+';height:'+chart_height_double+';"></canvas></div>',
                        },
                    ],
                    listeners:{activate: function() {
                        if (chartObj["feed_breakdown"].chart !== null){
                            return
                        }
                        //console.log(heifer_feed_breakdown_data)
                        chartObj.feed_breakdown.chart = create_graph(chartObj.feed_breakdown, 'Heifer Feeding Break Down', document.getElementById('feed_breakdown').getContext('2d'));

                    }}

                }],
            }



//------------------------------------------------------------------------------------------


        var bio = {
                title: '<i class="fa fa-leaf"></i>  Insecticide<br/> <progress class = "progres_bar" hidden = true value="0" max="100" id=bio_pb >50%</progress>',
                plain: true,
                id:"bioTab",
                disabled:true,
                tabBar : {
                    layout: {
                        pack: 'center',
                            //background: '#C81820',
                     }
                 },
                xtype: 'tabpanel',
                style: 'background-color: #377338;',

                defaults: {
                   border:false,
                    bodyBorder: false
                },
//                scrollable: true,
//                inner tabs for farm and field scale
                items:[{ xtype: 'panel',
                title: '<i class="fas fa-seedling"></i></i>  Field',
                 border: false,
                 id: 'insectFieldTab',
//                    disabled: true,
                layout: {
                    type: 'table',
                    // The total column count must be specified here
                    columns: 1
                },
                defaults: {

                style: 'padding:10px; ',
                border:0,
            },
                items:[ {xtype: 'container',
                    html: '<div id="container" ><canvas id="insecticide_field" style = "width:'+chart_width_double+';height:'+chart_height_double+';"></canvas></div>',
                    },
//                    {
//                        xtype: 'container',
//                        html: '<div id="container"><canvas  id="net_return_field" style = "width:'+chart_width+';height:'+chart_height+';"></canvas></div>',
//                    },{
//                        xtype: 'container',
//                    },{
//                        xtype: 'container',
//                        html: '<div id="container"><canvas  id="milk_field" style = "width:'+chart_width+';height:'+chart_height+';"></canvas></div>',
//                    }
                ],
                listeners:{activate: function() {
                    if (chartObj["insecticide_field"].chart !== null){
                        return
                    }
                    chartObj.insecticide_field.chart = create_graph(chartObj.insecticide_field, 'Honey Bee Toxicity', document.getElementById('insecticide_field').getContext('2d'));

                }}
            },
            {
                    xtype: 'container',
                    title: '<i class="fas fa-warehouse"></i>  Farm',
                    border: false,
                    layout: {
                        type: 'table',
                        // The total column count must be specified here
                        columns: 1
                    },
                    defaults: {

                    style: 'padding:10px; ',
                    border:0,
                },
                    items:[{
                        xtype: 'container',
                        html: '<div id="container" ><canvas id="insecticide_farm" style = "width:'+chart_width_double+';height:'+chart_height_double+';"></canvas></div>',
                        },
                    ],
                    listeners:{activate: function() {
                        if (chartObj["insecticide_farm"].chart !== null){
                            return
                        }
                        chartObj.insecticide_farm.chart = create_graph(chartObj.insecticide_farm, 'Honey Bee Toxicity', document.getElementById('insecticide_farm').getContext('2d'));

                    }}

                },
                
                ],
            }
            //TODO update
        var runoff = {
                title: '<i class="fas fa-cloud-rain"></i>  Runoff <br/> <progress class = "progres_bar" hidden = true value="0" max="100" id=runoff_pb >50%</progress>',
                plain: true,
                id:"runoffTab",
                disabled:true,
                tabBar : {
                    layout: {
                        pack: 'center',
                            //background: '#C81820',
                     }
                 },
                xtype: 'tabpanel',
                style: 'background-color: #377338;',

                defaults: {
                   border:false,
                    bodyBorder: false
                },
                scrollable: true,
//                inner tabs for farm and field scale
                items:[{
                    xtype: 'container',
                    title: '<i class="fas fa-warehouse"></i>  Farm',
                    border: false,
                    layout: {
                        type: 'table',
                        // The total column count must be specified here
                        columns: 1
                    },
                    defaults: {

                    style: 'padding:10px; ',
                    border:0,
                },
                    items:[{
                        xtype: 'container',
                        html: '<div id="container"><canvas  id="runoff_farm" style = "width:'+chart_width_double+';height:'+chart_height_double+';"></canvas></div>',

                    },{
                        xtype: 'container',
                        html: '<div id="container" ><canvas id="cn_num_farm" style = "width:'+chart_width_double+';height:'+chart_height_double+';"></canvas></div>',

                    },
//                    {
//                        xtype: 'container',
//                        html: '<div id="container"><canvas  id="canvas2" style = "width:'+chart_width+';height:'+chart_height+';"></canvas></div>',
//                    },{
//                        xtype: 'container',
//                        html: '<div id="container"><canvas  id="canvas3" style = "width:'+chart_width+';height:'+chart_height+';"></canvas></div>',
//                    }
                    ],
                    scope: this,
                    listeners:{activate: function() {
                        console.log("activated farm")
                        if (chartObj["cn_num_farm"].chart !== null){
                            return
                        }
                        chartObj.cn_num_farm.chart = create_graph(chartObj.cn_num_farm, 'Curve Number', document.getElementById('cn_num_farm').getContext('2d'));
                        chartObj.runoff_farm.chart = create_graph_line(chartObj.runoff_farm, 'Runoff', document.getElementById('runoff_farm').getContext('2d'));
                    }}
                },

                ],

            }
        var compare =  {
                title: '<i class="fa fa-balance-scale  fa-lg"></i>  Compare Scenarios',
                plain: true,
                id: "compareTab",
                disabled:true,
                tabConfig:{
                    tooltip: "Compare scenarios using a radar chart",
//                    cls: "myBar"
                },

                tabBar : {
                    layout: {
                        pack: 'center',
                           background_color: '#C81820',
                     }
                 },
                xtype: 'tabpanel',
                style: 'background-color: #377338;',

                defaults: {
                   border:false,
                    bodyBorder: false
                },
                scrollable: true,
//                inner tabs for farm and field scale
                items:[{
                    xtype: 'container',
                    title: '<i class="fas fa-warehouse"></i>  Select Data',
                    border: false,
                    scrollable:true,
                    layout: {
                        type: 'table',
                        // The total column count must be specified here
                        columns: 1
                    },
                    defaults: {
                        style: 'padding:10px; ',
                        border:0,
                    },
                    items:[{
                            xtype: 'combobox',
                            id: 'scenCombobox',
                            fieldLabel: 'Choose Base Scenario',
                            store: scenariosStore,
                            forceSelection: true,
                            queryMode: 'local',
                            displayField: 'name',
                            valueField: 'dbID',
                            listeners:{change: function() {
                                console.log("changing base scenario")
                                populateRadarChart()
                            }},
                        },{
                        title: "Yield",
                        xtype: 'panel',
                        width: chart_width,
                        collapsible: true,
                        items:[,
                        {
                         id: 'checkYield',
                           xtype: 'checkboxgroup',
                            layout: {
                                type: 'table',
                                // The total column count must be specified here
                                columns: 2
                            },
                            listeners:{change: function(box, newVal, oldVal, e) {
                                populateRadarChart()
                            }},
                            items:compCheckBoxes.yieldVar
                        }]
                    },
                    {
                        title: "Erosion",
                        xtype: 'panel',
                        width: chart_width,
                        collapsible: true,
                        scrollable: true,
                        items:[{
                              id: 'checkErosion',
                      xtype: 'checkboxgroup',
                            layout: {
                                type: 'table',
                                // The total column count must be specified here
                                columns: 2
                            },
                            listeners:{change: function(box, newVal, oldVal, e) {
                                populateRadarChart()
                            }},
                            items:compCheckBoxes.erosionVar
                        }]
                    },{
                        title: "Nutrients",
                        xtype: 'panel',
                        width: chart_width,
                        scrollable: true,
                        collapsible: true,
                        items:[{
                            xtype: 'checkboxgroup',
                         id: 'checkNutrients',
                           layout: {
                                type: 'table',
                                // The total column count must be specified here
                                columns: 2
                            },
                            listeners:{change: function(box, newVal, oldVal, e) {
                                populateRadarChart()
                            }},
                            items:compCheckBoxes.nutrientsVar
                        }]
                    },{
                        title: "Runoff",
                        xtype: 'panel',
                        width: chart_width,
                        collapsible: true,
                        items:[{
                            xtype: 'checkboxgroup',
                         id: 'checkRunoff',
                           layout: {
                                type: 'table',
                                // The total column count must be specified here
                                columns: 1
                            },
                            listeners:{change: function(box, newVal, oldVal, e) {
                                populateRadarChart()
                            }},
                            items:compCheckBoxes.runoffVar
                        }]
                    },{
                        title: "Insecticide",
                        xtype: 'panel',
                        width: chart_width,
                        collapsible: true,
                        items:[{
                          id: 'checkInsecticide',
                          xtype: 'checkboxgroup',
                            layout: {
                                type: 'table',
                                // The total column count must be specified here
                                columns: 1
                            },
                            listeners:{change: function(box, newVal, oldVal, e) {
                                populateRadarChart()
                            }},
                            items:compCheckBoxes.insectVar
                        }]
                    },
                    {
                        title: "Production Costs",
                        xtype: 'panel',
                        width: chart_width,
                        collapsible: true,
                        items:[{
                          id: 'checkCosts',
                          xtype: 'checkboxgroup',
                            layout: {
                                type: 'table',
                                // The total column count must be specified here
                                columns: 1
                            },
                            listeners:{change: function(box, newVal, oldVal, e) {
                                populateRadarChart()
                            }},
                            items:compCheckBoxes.costVar
                        }]
                    },
                    // {
                    //     title: "Feed Breakdown",
                    //     xtype: 'panel',

                    //     width: chart_width,
                    //     collapsible: true,
                    //     items:[{
                    //       id: 'checkInsecticide',
                    //       xtype: 'checkboxgroup',
                    //         layout: {
                    //             type: 'table',
                    //             // The total column count must be specified here
                    //             columns: 1
                    //         },
                    //         listeners:{change: function(box, newVal, oldVal, e) {
                    //             populateRadarChart()
                    //         }},
                    //         items:compCheckBoxes.insectVar
                    //     }]
                    // },
                    {
                        title: "Infrastructure",
                        xtype: 'panel',
                        width: chart_width,
                        collapsible: true,
                        items:[{
                            xtype: 'checkboxgroup',
                        id: 'checkInfrastructure',
                            layout: {
                                type: 'table',
                                // The total column count must be specified here
                                columns: 1
                            },
                            listeners:{change: function(box, newVal, oldVal, e) {
                                populateRadarChart()
                            }},
                            items:compCheckBoxes.infraVar
                        }]
                    },
                    ],
                    scope: this,
                    listeners:{activate: function() {
                        console.log("activated data select")
//                        Ext.getCmp("scenCombobox").setValue(scenariosStore.getAt('0').get('name'))
//                        Ext.getCmp('scenCombobox').setValue(scenariosStore.getAt('0').get('name'));

                    }}
                },
                { xtype: 'panel',
                    title: '<i class="fas fa-seedling"></i></i>  Comparison',
                     border: false,
                     scrollable: true,

                    layout: {
                        type: 'table',
                        // The total column count must be specified here
                        columns: 1
                    },
                    defaults: {

                    style: 'padding:10px; ',
                    border:0,
                },
                    items:[{
                        xtype: 'container',
                        html: '<div id="container" ><canvas id="compare_farm" style = "width:'+chart_width_double+';height:'+chart_height_double+';"></canvas></div>',
                    },

                    ],
                   scope: this,
                    listeners:{activate: function() {
                        console.log("activated farm")
                          if (chartObj["compare_farm"].chart !== null){

                            chartObj.compare_farm.chart.update()

                            return
                        }
                        chartObj.compare_farm.chart = create_graph_radar(chartObj.compare_farm, chartObj.compare_farm.title, document.getElementById('compare_farm').getContext('2d'));


                    }}
                }
                ],

            }
        var summary =  { title: '<i class="fas fa-book-open  fa-lg"></i>  Summary Report',
            disabled:true,
            plain: true,
            tabConfig:{
                    tooltip: "Download a report of model outputs, infrastructure and chart images",
//                    cls: "myBar"
                },
            id: "compareTabBtn",
                tabBar : {
                    layout: {
                        pack: 'center',
                            //background: '#C81820',
                     }
                 },
                xtype: 'tabpanel',
                style: 'background-color: #377338;',

                defaults: {
                   border:false,
                    bodyBorder: false
                },
                scrollable: true,
//                inner tabs for farm and field scale
                listeners:{activate: function() {
                    downloadSummaryCSV(chartObj)
                }},

                items:[{
                    
                    xtype: 'container',
                    title: '<i class="fas fa-warehouse"></i>  Farm',
                    border: false,
                    layout: {
                        type: 'table',
                        // The total column count must be specified here
                        columns: 2
                    },
                    defaults: {

                        style: 'padding:10px; ',
                        border:0,
                    },
                    items:[
                        {
                            title: "Yield",
                            xtype: 'panel',
                            width: chart_width,
                            collapsible: true,
                            items:[,
                            {
                             id: 'checkYieldSummary',
                               xtype: 'checkboxgroup',
                                layout: {
                                    type: 'table',
                                    // The total column count must be specified here
                                    columns: 2
                                },
                                // listeners:{change: function(box, newVal, oldVal, e) {
                                //     populateRadarChart()
                                // }},
                                items:compCheckBoxes.yieldVar
                            }]
                        },
                        {
                            title: "Erosion",
                            xtype: 'panel',
                            width: chart_width,
                            collapsible: true,
                            scrollable: true,
                            items:[{
                                  id: 'checkErosionSummary',
                          xtype: 'checkboxgroup',
                                layout: {
                                    type: 'table',
                                    // The total column count must be specified here
                                    columns: 2
                                },
                                listeners:{change: function(box, newVal, oldVal, e) {
                                    populateRadarChart()
                                }},
                                items:compCheckBoxes.erosionVar
                            }]
                        },{
                            title: "Nutrients",
                            xtype: 'panel',
                            width: chart_width,
                            scrollable: true,
                            collapsible: true,
                            items:[{
                                xtype: 'checkboxgroup',
                             id: 'checkNutrientsSummary',
                               layout: {
                                    type: 'table',
                                    // The total column count must be specified here
                                    columns: 2
                                },
                                listeners:{change: function(box, newVal, oldVal, e) {
                                    populateRadarChart()
                                }},
                                items:compCheckBoxes.nutrientsVar
                            }]
                        },{
                            title: "Runoff",
                            xtype: 'panel',
                            width: chart_width,
                            collapsible: true,
                            items:[{
                                xtype: 'checkboxgroup',
                             id: 'checkRunoffSummary',
                               layout: {
                                    type: 'table',
                                    // The total column count must be specified here
                                    columns: 1
                                },
                                listeners:{change: function(box, newVal, oldVal, e) {
                                    populateRadarChart()
                                }},
                                items:compCheckBoxes.runoffVar
                            }]
                        },{
                            title: "Insecticide",
                            xtype: 'panel',
                            width: chart_width,
                            collapsible: true,
                            items:[{
                              id: 'checkInsecticideSummary',
                              xtype: 'checkboxgroup',
                                layout: {
                                    type: 'table',
                                    // The total column count must be specified here
                                    columns: 1
                                },
                                listeners:{change: function(box, newVal, oldVal, e) {
                                    populateRadarChart()
                                }},
                                items:compCheckBoxes.insectVar
                            }]
                        },
                        {
                            title: "Production Costs",
                            xtype: 'panel',
                            width: chart_width,
                            collapsible: true,
                            items:[{
                              id: 'checkCostsSummary',
                              xtype: 'checkboxgroup',
                                layout: {
                                    type: 'table',
                                    // The total column count must be specified here
                                    columns: 1
                                },
                                listeners:{change: function(box, newVal, oldVal, e) {
                                    console.log(box, newVal, oldVal, e)
                                }},
                                items:compCheckBoxes.costVar
                            }]
                        },
                        {
                            xtype: 'button',
                            text: 'Download Summary Report PDF',
                            id: 'downloadSummaryBtn',
                            tooltip: 'Download summary report PDF',
                            handler: function(e) {
                                downloadSummaryPdf()
                            }
                        },
                        //There is a listener set up in DashBoardUtilities that runs when this button is clicked to download summary csv to users machine.
                        {
                            xtype: 'button',
                            text: 'Download Summary Report CSV',
                            id: 'downloadSummaryCSV',
                            tooltip: 'Download charts and csv',
                            handler: function(e) {
                                console.log(e)
                            }
                        }
                    
                    ],

                }]
            }
        var summaryTable = {
                title: '<i class="fas fa-globe"></i>  Field Summary',
                plain: true,
                tabConfig:{
                    tooltip: "Control options and visibility of charts",
//                    cls: "myBar"
                },
                tabBar : {
                    layout: {
                        pack: 'center',
                            //background: '#C81820',
                     }
                 },
                xtype: 'tabpanel',
                style: 'background-color: #377338;',

                defaults: {
                   border:false,
                    bodyBorder: false
                },
                scrollable: true,
//                inner tabs for farm and field scale
                items:[{
                    xtype: 'container',
                    title: '<i class="fas fa-tasks"></i>  Active Scenario Field Attributes',
                    border: false,
                    layout: {
                        type: 'table',
                        // The total column count must be specified here
                        columns: 1
                    },
                    defaults: {

                    style: 'padding:10px; ',
                    border:1,
                },

                //This panel is a field summary of the nutrients and settings for each field in the model run.  
                items:[
                    Ext.create('Ext.grid.Panel', {
                    title: 'Active Scenario Field Summary',
                    store: Ext.data.StoreManager.lookup('fieldSummaryStore'),
                    singleton: true,
                    autoDestroy: false,
                    alternateClassName: 'DSS.Field_Summary_Table',
                    id: "SummaryTable",
                    hidden: false,
                    style: 'columnLineColor: Red',
                    columnLines: true,
                    rowLines: true,
                    columns: [
                        {text: 'Field IDs',editable: false,hideable: false,  minWidth: 24,locked: true, border:2, //style: 'border-color: Black',
                            columns:[
                                {
                                    text: 'Field', dataIndex: 'field_name', width: 70, 
                                    editable: false,
                                    hideable: false,  minWidth: 24,
                                    locked: true,
                                    tooltip: '<b>Field Name:</b> Can be editted and relabeled here.',
                                },
                                {
                                    text: 'Crop Rotation', dataIndex: 'crop_ro', width: 150, 
                                    editable: false,
                                    hideable: false, enableColumnHide: false, minWidth: 24,
                                    tooltip: '<b>Crop Rotation</b> Which crop rotation is being grown in each field.',
                                },
                                {
                                    text: 'Crop', dataIndex: 'crop', width: 110, 
                                    editable: false,locked: true,
                                    hideable: false, enableColumnHide: false, minWidth: 24,
                                    tooltip: '<b>Crop</b> Which crop is being grown in a single year within the crop rotation.',
                                },
                                {
                                    text: 'Year', dataIndex: 'year', width: 50, 
                                    editable: false,
                                    hideable: false, enableColumnHide: false, minWidth: 24,
                                    tooltip: '<b>Year</b> The year inwhich the crop is being grown in the crop rotation',
                                },
                            ]
                        },
                        {text: 'Nutrient management (N)',editable: false, hideable: false, minWidth: 24, border:2, //style: 'border-color: Black',
                            columns:[
                                {
                                    xtype: 'numbercolumn',
                                    format: '0.0',
                                    text: '% Fert N', 
                                    dataIndex: 'fertPercN', 
                                    width: 80, 
                                    tooltip: '<b>Percent Nitrogen Fertilizer</b> Amount of fertilizer N applied to the crop rotation as a percentage of the N recommended based on UW-Extension guidelines (A2809). For example, a value of 100% would indicate that N applications are identical to recommendations.',
                                    editable: false,
                                },
                                {
                                    xtype: 'numbercolumn',
                                    format: '0.0',
                                    text: '% Manure N', 
                                    dataIndex: 'manuPercN', 
                                    width: 120, tooltip: '<b>Percent Nitrogen Manure</b> Amount of manure N applied to the crop rotation as a percentage of the N recommended based on UW-Extension guidelines (A2809) (for legumes, the percentage is based on manure N allowable). For example, a value of 100% would indicate that N applications are identical to recommendations. Note that in grazed systems, manure N is already applied and does not need to be accounted for here.',
                                    editable: false,
                                },
                                {
                                    xtype: 'numbercolumn',
                                    format: '0.0',
                                    text: 'N recommendation (lb/ac)',
                                    dataIndex: 'Nrec', 
                                    width: 120, 
                                    editable: false,
                                    hideable: false,
                                    tooltip: '<b>Recommended N</b> Recommended N application for crop based on UW-Extension guidelines (A2809)',
                                },
                                {
                                    xtype: 'numbercolumn',
                                    format: '0.0',
                                    text: 'Manure N allowed (lb/ac)', 
                                    dataIndex: 'nManure', 
                                    width:180, 
                                    tooltip: '<b>Nitrogen Applied via Manure per Acre</b> Manure N allowed for legume crops based on allowable units of nitrogen found in the NRCS-WI Conservation Planning Technical Note 1 - Nutrient Management (590) (dated February 2016; Table 2)',
                                    editable: false,
                                },
                                {
                                    xtype: 'numbercolumn',
                                    format: '0.0',
                                    text: 'Fert N Applied (lb/ac)', 
                                    dataIndex: 'fertAppliedN', 
                                    width: 160, 
                                    tooltip: '<b>Applied Nitrogen Fertilizer per Acre</b> Applied amount of N fertilizer per acre',
                                    editable: false,
                                },
                                {
                                    xtype: 'numbercolumn',
                                    format: '0.0',
                                    text: 'Manure N Applied (lb/ac)', 
                                    dataIndex: 'manuAppliedN', 
                                    width:180, 
                                    tooltip: '<b>Nitrogen Applied via Manure per Acre</b> Applied amount of N coming from spread manure per acre',
                                    editable: false,
                                },
                            ]
                        },
                        {text: 'Nutrient management (P)',editable: false, hideable: false, minWidth: 24, border:2, //style: 'border-color: Black',
                            columns:[
                                {
                                    xtype: 'numbercolumn',
                                    format: '0.0',
                                    text: '% Fert P', 
                                    dataIndex: 'fertPercP', 
                                    width: 80, 
                                    tooltip: '<b>Percent Phosphorus Fertilizer</b> The amount of fertilizer P applied to the crop rotation as a percentage of the P removed by the crop rotation harvest (e.g., value of 100 means that P inputs and outputs are balanced).',
                                    editable: false,
                                },
                                {
                                    xtype: 'numbercolumn',
                                    format: '0.0',
                                    text: '% Manure P', 
                                    dataIndex: 'manuPercP', 
                                    width: 110, tooltip: '<b>Percent Phosphorus Manure</b> The amount of manure P applied to the crop rotation as a percentage of the P removed by the crop rotation harvest (e.g., value of 100 means that P inputs and outputs are balanced). Note that in grazed systems, manure P is already applied and does not need to be accounted for here.',
                                    editable: false,
                                },
                                {
                                    xtype: 'numbercolumn',
                                    format: '0.0',
                                    text: 'P removal (lb/ac)', 
                                    dataIndex: 'pNeeds', 
                                    width: 80, 
                                    editable: false,
                                    hideable: false,
                                    tooltip: '<b>Phosphorus Needs of Crop</b> Measured as pounds per acre',
                                },
                                {
                                    xtype: 'numbercolumn',
                                    format: '0.0',
                                    text: 'Fert P Applied (lb/ac)', 
                                    dataIndex: 'fertAppliedP', 
                                    width: 160, 
                                    tooltip: '<b>Applied Phosphorus Fertilizer per Acre</b> Applied amount of P fertilizer per acre',
                                    editable: false,
                                },
                                {
                                    xtype: 'numbercolumn',
                                    format: '0.0',
                                    text: 'Manure P Applied (lb/ac)', 
                                    dataIndex: 'manuAppliedP', 
                                    width: 190, 
                                    tooltip: '<b>Phosphorus Applied via Manure per Acre</b> Applied amount of P coming from spread manure per acre',
                                    editable: false,
                                },
                            ]
                        },
                        {text: 'Additional Management',editable: false, hideable: false, minWidth: 24, border:2, //style: 'border-color: Black',
                            columns:[
                                {
                                    text: 'Cover Crop', dataIndex: 'coverCropDisp', width: 180, 
                                    editable: false,
                                    hideable: false,  minWidth: 24,
                                    tooltip: '<b>Cover Crop</b> Which cover crop is being grown on each field during the none growing season',
                                },
                                {
                                    text: 'Tillage', dataIndex: 'tillageDisp', width: 180, 
                                    editable: false,
                                    hideable: false,  minWidth: 24,
                                    tooltip: '<b>Tillage</b> Which tillage practice is being used on each field',
                                },
                                {
                                    text: 'On Contour', dataIndex: 'onContour', width: 90, 
                                    editable: false,
                                    hideable: false,  minWidth: 24,
                                    tooltip: '<b>Tillage On Contour</b>Was this field tillage along the contour of the land or not?',
                                },
                                {
                                    text: 'Grass Species', dataIndex: 'grassSpeciesDisp', width: 150, 
                                    tooltip: '<b>Low Yielding:</b> Italian ryegrass, Kentucky bluegrass, Quackgrass, Meadow fescue (older varieties)\n<b>Medium Yielding:</b> Meadow fescue (newer varieties), Smooth bromegrass, Timothy, Perennial ryegrass\n<b>High Yielding:</b> Orchardgrass, Reed canary grass, Tall fescue, Festulolium, Hybrid and Meadow bromegrass',
                                    editable: false,
                                    hideable: false,  minWidth: 24,
                                    
                                },
                                {
                                    text: 'Rotational Frequency', dataIndex: 'rotationFreqDisp', width: 150,
                                    tooltip: '<b>Pasture Rotational Frequency</b> How often the animals are rotated on and off each paddock. For rotated animals, we assume density - 1 AU/ac for 244 grazing days. For continuous pasture, animal density is defined in the animal density column.',
                                    editable: false,
                                    hideable: false,  minWidth: 24,
                                    
                                },
                                {
                                    text: 'Interseeded Legume', dataIndex: 'interseededClover', width: 145,
                                    editable: false,
                                    hideable: false,  minWidth: 24,
                                    tooltip: '<b>Interseeded Legumes:</b> Are you planting nitrogen fixing legumes like clover.',
                                },
                                {
                                    text: 'Animal Density', dataIndex: 'grazeDensityDisp', width: 110,
                                    tooltip: '<b>Grazing Density</b> Pasture continuous high density = 1.5 AU/ac for 244 grazing days; pasture continuous low density = 0.5 AU/ac for 244 grazing days; dry lot low density = 2 AU/ac for 244 days; dry lot high density = 10 AU/ac for 244 days',
                                    editable: false,
                                    hideable: false,  minWidth: 24,
                                    
                                },
                            ]
                        },
                        {text: 'Summary stats',editable: false, hideable: false, minWidth: 24, border:2, //style: 'border-color: Black',
                            columns:[
                                {
                                    xtype: 'numbercolumn',
                                    width: 60, 
                                    format: '0.0',
                                    text: 'Area',
                                    dataIndex: 'area',
                                    //flex: 1,
                                    tooltip:"in acres",
                                    editable: false,
                                    hideable: false,
                                },
                                {
                                    xtype: 'numbercolumn',
                                    format: '0.0',
                                    text: 'Soil-P (PPM)', 
                                    dataIndex: 'soilP',
                                    width: 100,
                                    tooltip: '<b>Soil Phosphorus:</b> Measured in parts per million.',
                                    hideable: false,
                                },
                                {
                                    xtype: 'numbercolumn',
                                    format: '0.0',
                                    text: 'Soil-OM (%)', 
                                    dataIndex: 'soilOM', 
                                    width: 100, 
                                    editable: false,
                                    hideable: false,
                                    tooltip: '<b>Soil Organic Matter</b> Measured in percent of soil make up',
                                },
                            ]
                        },
                        {text: 'Economics',editable: false, hideable: false, minWidth: 24, border:2, //style: 'border-color: Black',
                            columns:[
                                {
                                    xtype: 'numbercolumn',
                                    format: '0.0',
                                    text: 'Land Cost ($/ac)',
                                    dataIndex: 'landCost',
                                    tooltip: '<b>Land Cost:</b> How much does each field cost to rent or own per acre',
                                    formatter: 'usMoney',
                                    minWidth: 24,
                                    width: 110,
                                    editable: false,
                                    hideable: false,
                                },
                            ]
                        },
                    ],
                    resizable: true,
                    scrollable: true,
                    height: 400,
                    width: 1100,
                    //renderTo: Ext.getBody(),
                    
                })
                    
                    // {
                    //     xtype: 'label',
                    //     cls: 'information med-text',
                    //     html: 'Summary Table Dashboard'
                    // },
                    //Ext.getCmp('SummaryTable')
                    
                ],
                //scope: this,
                listeners:{activate: async function() {
                    console.log("manureP")
                    console.log(pmanureReturn_array)
                    console.log(fieldArray)
                    fieldSummaryArray=[]
                    fieldSummaryArray = await Assemblefieldsummarry(fieldArray,pmanureReturn_array)
                    console.log(fieldSummaryArray)
                    Ext.create('Ext.data.Store', {
                        storeId: 'fieldSummaryStore1',
                        alternateClassName: 'DSS.FieldStore',
                        fields:[ 'field_name', 'soilP', 'soilOM','area', 'crop_ro', 'crop', 'fertAppliedN', 'fertAppliedP', 
                            'fertPercP','manuPercP','fertPercN','manuPercN','manuAppliedN','manuAppliedP','nManure',
                            'pNeeds','year','Nrec','grazeDensityDisp','landCost','interseededClover','tillageDisp','coverCropDisp','onContour','grassSpeciesDisp','rotationFreqDisp'],
                            sorters: ['field_name'],
                        data: fieldSummaryArray
                    });
                    Ext.getCmp('SummaryTable').setStore(Ext.data.StoreManager.lookup('fieldSummaryStore1'));
			        Ext.getCmp('SummaryTable').store.reload();
                //     setTimeout(() => {
                //         //Ext.getCmp('SummaryTable').getView().refresh()
                //         Ext.getCmp('fieldTable').getView().refresh()
                //          Ext.getCmp('fieldTable').setHidden(false)
                //         console.log(ModelSummaryData)
                // }, "250")
                    //AppEvents.triggerEvent('show_field_grid');
                    //fieldSummaryArray = []
                }}

                },
                ],

            }
            var options = {
                title: '<i class="fas fa-globe"></i>  Options',
                plain: true,
                tabConfig:{
                    tooltip: "Control options and visibility of charts",
//                    cls: "myBar"
                },
                tabBar : {
                    layout: {
                        pack: 'center',
                            //background: '#C81820',
                     }
                 },
                xtype: 'tabpanel',
                style: 'background-color: #377338;',

                defaults: {
                   border:false,
                    bodyBorder: false
                },
                scrollable: true,
                listeners:{activate: function() {
                    console.log("options")
                    if(Ext.getCmp('fieldLegend').items.length<1){

                        Ext.getCmp('fieldLegend').add(checkBoxField)
                        Ext.getCmp('scenLegend').add(checkBoxScen)
                    }
                }},

//                inner tabs for farm and field scale
                items:[{
                    xtype: 'container',
                    title: '<i class="fas fa-tasks"></i>  Data Selection',
                    border: false,
                    layout: {
                        type: 'table',
                        // The total column count must be specified here
                        columns: 2
                    },
                    defaults: {

                    style: 'padding:10px; ',
                    border:0,
                },


                items:[{
                    xtype: 'checkboxgroup',
                    fieldLabel: 'Scenario',
                    columns: 1,
                     vertical: true,
                    id: 'scenLegend',
//                    collapsible: true,
                    labelAlign: 'top',
                    defaultType: 'checkboxfield',
                    items:checkBoxScen,


                },{
                    xtype: 'checkboxgroup',
                    fieldLabel: 'Field',
                    columns: 1,
                     vertical: true,
                    id: 'fieldLegend',
                    labelAlign: 'top',
                    defaultType: 'checkboxfield',
                    items: checkBoxField,

                },{
                    xtype: 'buttongroup',
                    items: [{
                        text: 'Select All',
                         handler: function() {
                            for (let scen in chartDatasetContainer.scenarios){
                                Ext.getCmp("checkBox_scen_"+scen).setValue(true);

                            }
                        }

                    },
                    {
                        text: 'Deselect All',
                        handler: function() {
                            for (let scen in chartDatasetContainer.scenarios){
                                Ext.getCmp("checkBox_scen_"+scen).setValue(false);

                            }
                        }

                    }]
                },{

                    xtype: 'buttongroup',
                    items: [{
                        text: 'Select All',
                         handler: function() {
                            for (let field in chartDatasetContainer.fields){
                                Ext.getCmp("checkBox_field_"+field).setValue(true);
                            }
                        }
                        },
                    {
                        text: 'Deselect All',
                        handler: function() {
                            for (let field in chartDatasetContainer.fields){
                                Ext.getCmp("checkBox_field_"+field).setValue(false);
                            }
                        }

                    }]


                }],
                scope: this,
                listeners:{activate: function() {

                }}

                },
                ],

            }
            var outputLayers =  {
            title: 'Mapped Results',
            disabled:true,
            id:"mappedResultsTab",
            name:"mappedResultsTab",
            plain: true,
            tabConfig:{
                    tooltip: "Turn output layers on and off, on the map",
//                    cls: "myBar"
                },
            id: "layersBtn",
            tabBar : {
                layout: {
                    pack: 'center',
                        background: '#C81820',
                    }
                },
            xtype: 'tabpanel',
            style: 'background-color: #377338;',
            defaults: {
                border:false,
                bodyBorder: false,
            },
            scrollable: true,
            listeners:{activate: function() {
                if(modelruntime == ''){
                    modelruntime = modelruntimeOrig
                    console.log(modelruntime)
                }
                console.log("MAPPED RESULTS ACTIVATED!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
                var layerslengtharray = DSS.layer.PLossGroup.getLayers().getArray().length
                //Check to see if models were run and thus if there are new pngs to work with.

                //AFTER 3/9/2022 the layerslengtharray should always be <1. No PNGS should be present in the group layers 
                //until the mapped results button is clicked!  ELSE is kept as legacy.  Will be removed in next dev push!
                if(layerslengtharray < 1){
                    // var plossPNGFile = ''
                    // var eroPNGFile = ''
                    // var yieldPNGFile = ''
                    console.log("No pngs ")
                    console.log(modelruntime)
                    var fArray = []
                    var fExtents = []
                    DSS.layer.fields_1.getSource().getFeatures().forEach(function(f) {
                        fArray.push(f);
                    })
                    console.log(fArray);
                    //You need to find out whats in the image files, so you can get the proper model run number

                    for(i in fArray){
                        //modelruntime = fArray[i].values_.model_time_stamp
                        //modelruntimeFromDB = fArray[i].values_.model_time_stamp
                        // THIS MIGHT HAVE FIXED THE OLD MAPS ISSUE! LOOK UP modelruntime AT TIME OF DISPLAY!!!! 04292022
                        modelruntimeFromDB = modelruntime
                        fExtents = fArray[i].values_.geometry.extent_
                        for(e in fExtents){
                            fExtents[e] = parseFloat(fExtents[e]).toFixed(4)
                        }
                        fExtentsNum = fExtents.map(Number);
                        //var fId = fArray[i].values_.gid
                        console.log(fExtentsNum)
                        //console.log(fId)
                        console.log(modelruntimeFromDB)
                        field_png_lookup({model_field:['ploss'+ String(fArray[i].values_.gid)]},'ploss',fExtentsNum)
                        field_png_lookup({model_field:['ero'+ String(fArray[i].values_.gid)]},'ero',fExtentsNum)
                        field_png_lookup({model_field:['Rotational Average'+ String(fArray[i].values_.gid)]},'yield',fExtentsNum)
                        field_png_lookup({model_field:['nleaching'+ String(fArray[i].values_.gid)]},'nleaching',fExtentsNum)
                        setTimeout(() => {console.log('sup')},100)

                    }
                    Ext.ComponentQuery.query('window[name="dashboardWindow"]')[0].setHeight('40%')
                    Ext.ComponentQuery.query('window[name="dashboardWindow"]')[0].setWidth('60%')

                // AFTER 3/9/2022 THIS ELSE SHOULD NEVER GET HIT!  KEPT FOR LEGACY EXAMPLE!!! Might remove next dev push

                }else{
                    console.log("PNGs present")
                    //Since PNGs are present in the layer groups, this series of functions edits the layer's urls with the latest
                    //modelruntime value to make sure the latest model run is being shown to the user.
                    var fArray = []
                    var fExtents = []
                    DSS.layer.fields_1.getSource().getFeatures().forEach(function(f) {
                        fArray.push(f);
                    })
                    console.log(fArray);
                    DSS.map.removeLayer(DSS.layer.PLossGroup);
                    DSS.map.addLayer(DSS.layer.PLossGroup)
                    DSS.map.removeLayer(DSS.layer.erosionGroup);
                    DSS.map.addLayer(DSS.layer.erosionGroup)
                    DSS.map.removeLayer(DSS.layer.nleachingGroup);
                    DSS.map.addLayer(DSS.layer.nleachingGroup)
                    DSS.map.removeLayer(DSS.layer.runoffGroup);
                    DSS.map.addLayer(DSS.layer.runoffGroup)
                    DSS.map.removeLayer(DSS.layer.yieldGroup);
                    DSS.map.addLayer(DSS.layer.yieldGroup)
                    for (i in fArray){
                        DSS.layer.PLossGroup.getLayers().forEach(function(layer){
                            console.log(layer)
                            var gidFromName = layer.values_.name.slice(5)
                            console.log(gidFromName)
                            modelruntime = fArray[i].values_.model_time_stamp
                            console.log(modelruntime)
                            if (String(fArray[i].values_.gid)==gidFromName){
                                var extents = layer.values_.source.imageExtent_
                                //Use this form when you have unique model run ids.
                                layer.setSource(new ol.source.ImageStatic({
                                    url: '/static/grazescape/public/images/'+ layer.values_.name + '_'+ modelruntime + '.png',
                                    imageExtent: extents
                                }))
                                layer.getSource().changed();
                            }else{
                                modelruntimeFromDB = fArray[i].values_.model_time_stamp
                                fExtents = fArray[i].values_.geometry.extent_
                                for(e in fExtents){
                                    console.log(fExtents[e])
                                    console.log(typeof fExtents[e])
                                    fExtents[e] = parseFloat(fExtents[e]).toFixed(4)
                                }
                                fExtentsNum = fExtents.map(Number);
                                var fId = fArray[i].values_.gid
                                console.log(fExtentsNum)
                                console.log(fId)
                                DSS.layer.ploss_field = new ol.layer.Image({
                                    visible: false,
                                    opacity: 1,
                                    updateWhileAnimating: true,
                                    updateWhileInteracting: true,
                                    source: new ol.source.ImageStatic({
                                    url:'/static/grazescape/public/images/ploss'+ String(fId) + '_' + modelruntimeFromDB + '.png',
                                    imageExtent: fExtentsNum
                                    })
                                })
                                DSS.layer.ploss_field.set('name', 'ploss'+ String(fId));
                                DSS.layer.ploss_field.getSource().refresh();
                                DSS.layer.ploss_field.getSource().changed();
                                DSS.map.addLayer(DSS.layer.ploss_field)
                                var plossGroupLayers = DSS.layer.PLossGroup.getLayers().getArray();
                                if(plossGroupLayers.length == 0){
                                    plossGroupLayers.push(DSS.layer.ploss_field);
                                }
                                else{
                                    for(l in plossGroupLayers){
                                        console.log(plossGroupLayers[l].values_.name)
                                        console.log(DSS.layer.ploss_field.values_.name)
                                        if(plossGroupLayers[l].values_.name == DSS.layer.ploss_field.values_.name){
                                            const index = plossGroupLayers.indexOf(plossGroupLayers[l]);
                                            if(index > -1) {
                                                plossGroupLayers.splice(index,1);
                                                console.log("SPLICED :" + DSS.layer.ploss_field.values_.name)
                                            }
                                            plossGroupLayers.push(DSS.layer.ploss_field);
                                        }
                                    }
                                plossGroupLayers.push(DSS.layer.ploss_field);
                                }
                                DSS.map.removeLayer(DSS.layer.ploss_field)
                            }
                        })
                    }
                    for (i in fArray){
                        console.log("IN NLEACHING LOOK THROUGH LAYERS")
                        DSS.layer.nleachingGroup.getLayers().forEach(function(layer){
                            console.log(layer)
                            var gidFromName = layer.values_.name.slice(9)
                            console.log(gidFromName)
                            modelruntime = fArray[i].values_.model_time_stamp
                            console.log(modelruntime)
                            if (String(fArray[i].values_.gid)==gidFromName){
                                var extents = layer.values_.source.imageExtent_

                                //Use this form when you have unique model run ids.
                                layer.setSource(new ol.source.ImageStatic({
                                    url: '/static/grazescape/public/images/'+ layer.values_.name + '_'+ modelruntime + '.png',
                                    imageExtent: extents
                                }))
                                layer.getSource().changed();
                            }else{
                                modelruntimeFromDB = fArray[i].values_.model_time_stamp
                                fExtents = fArray[i].values_.geometry.extent_
                                for(e in fExtents){
                                    console.log(fExtents[e])
                                    console.log(typeof fExtents[e])
                                    fExtents[e] = parseFloat(fExtents[e]).toFixed(4)
                                }
                                fExtentsNum = fExtents.map(Number);
                                var fId = fArray[i].values_.gid
                                console.log(fExtentsNum)
                                console.log(fId)
                                DSS.layer.nleaching_field = new ol.layer.Image({
                                    visible: false,
                                    opacity: 1,
                                    updateWhileAnimating: true,
                                    updateWhileInteracting: true,
                                    source: new ol.source.ImageStatic({
                                    url:'/static/grazescape/public/images/nleaching'+ String(fId) + '_' + modelruntimeFromDB + '.png',
                                    imageExtent: fExtentsNum
                                    })
                                })
                                DSS.layer.nleaching_field.set('name', 'nleaching'+ String(fId));
                                DSS.layer.nleaching_field.getSource().refresh();
                                DSS.layer.nleaching_field.getSource().changed();
                                DSS.map.addLayer(DSS.layer.nleaching_field)
                                var nleachingGroupLayers = DSS.layer.nleachingGroup.getLayers().getArray();
                                if(nleachingGroupLayers.length == 0){
                                    nleachingGroupLayers.push(DSS.layer.nleaching_field);
                                }
                                else{
                                    for(l in nleachingGroupLayers){
                                        console.log(nleachingGroupLayers[l].values_.name)
                                        console.log(DSS.layer.nleaching_field.values_.name)
                                        if(nleachingGroupLayers[l].values_.name == DSS.layer.nleaching_field.values_.name){
                                            const index = nleachingGroupLayers.indexOf(nleachingGroupLayers[l]);
                                            if(index > -1) {
                                                nleachingGroupLayers.splice(index,1);
                                                console.log("SPLICED :" + DSS.layer.nleaching_field.values_.name)
                                            }
                                            nleachingGroupLayers.push(DSS.layer.nleaching_field);
                                        }
                                    }
                                nleachingGroupLayers.push(DSS.layer.nleaching_field);
                                }
                                DSS.map.removeLayer(DSS.layer.nleaching_field)
                            }
                        })
                    }
                    for (i in fArray){
                        DSS.layer.erosionGroup.getLayers().forEach(function(layer){
                            console.log(layer)
                            var gidFromName = layer.values_.name.slice(7)
                            console.log(gidFromName)
                            modelruntime = fArray[i].values_.model_time_stamp
                            console.log(modelruntime)
                            if (String(fArray[i].values_.gid)==gidFromName){
                                var extents = layer.values_.source.imageExtent_
                                //Use this form when you have unique model run ids.
                                layer.setSource(new ol.source.ImageStatic({
                                    url: '/static/grazescape/public/images/'+ layer.values_.name + '_'+ modelruntime + '.png',
                                    imageExtent: extents
                                }))
                                layer.getSource().changed();
                            }else{
                                modelruntimeFromDB = fArray[i].values_.model_time_stamp
                                fExtents = fArray[i].values_.geometry.extent_
                                for(e in fExtents){
                                    console.log(fExtents[e])
                                    console.log(typeof fExtents[e])
                                    fExtents[e] = parseFloat(fExtents[e]).toFixed(4)
                                }
                                fExtentsNum = fExtents.map(Number);
                                var fId = fArray[i].values_.gid
                                console.log(fExtentsNum)
                                console.log(fId)
                                DSS.layer.erosion_field = new ol.layer.Image({
                                    visible: false,
                                    opacity: 1,
                                    updateWhileAnimating: true,
                                    updateWhileInteracting: true,
                                    source: new ol.source.ImageStatic({
                                    url:'/static/grazescape/public/images/ero'+ String(fId) + '_' + modelruntimeFromDB + '.png',
                                    imageExtent: fExtentsNum
                                    })
                                })
                                DSS.layer.erosion_field.set('name', 'ero'+ String(fId));
                                DSS.layer.erosion_field.getSource().refresh();
                                DSS.layer.erosion_field.getSource().changed();
                                DSS.map.addLayer(DSS.layer.erosion_field)
                                var erosionGroupLayers = DSS.layer.erosionGroup.getLayers().getArray();
                                if(erosionGroupLayers.length == 0){
                                    erosionGroupLayers.push(DSS.layer.erosion_field);
                                }
                                else{
                                    for(l in erosionGroupLayers){
                                        console.log(erosionGroupLayers[l].values_.name)
                                        console.log(DSS.layer.erosion_field.values_.name)
                                        if(erosionGroupLayers[l].values_.name == DSS.layer.erosion_field.values_.name){
                                            const index = erosionGroupLayers.indexOf(erosionGroupLayers[l]);
                                            if(index > -1) {
                                                erosionGroupLayers.splice(index,1);
                                                console.log("SPLICED :" + DSS.layer.erosion_field.values_.name)
                                            }
                                            erosionGroupLayers.push(DSS.layer.erosion_field);
                                        }
                                    }
                                erosionGroupLayers.push(DSS.layer.erosion_field);
                                }
                                DSS.map.removeLayer(DSS.layer.erosion_field)
                            }
                        })
                    }
                    for (i in fArray){
                        DSS.layer.runoffGroup.getLayers().forEach(function(layer){
                            console.log(layer)
                            var gidFromName = layer.values_.name.slice(6)
                            console.log(gidFromName)
                            modelruntime = fArray[i].values_.model_time_stamp
                            console.log(modelruntime)
                            if (String(fArray[i].values_.gid)==gidFromName){
                                var extents = layer.values_.source.imageExtent_
                                //Use this form when you have unique model run ids.
                                layer.setSource(new ol.source.ImageStatic({
                                    url: '/static/grazescape/public/images/'+ layer.values_.name + '_'+ modelruntime + '.png',
                                    imageExtent: extents
                                }))
                                layer.getSource().changed();
                            }else{
                                modelruntimeFromDB = fArray[i].values_.model_time_stamp
                                fExtents = fArray[i].values_.geometry.extent_
                                for(e in fExtents){
                                    console.log(fExtents[e])
                                    console.log(typeof fExtents[e])
                                    fExtents[e] = parseFloat(fExtents[e]).toFixed(4)
                                }
                                fExtentsNum = fExtents.map(Number);
                                var fId = fArray[i].values_.gid
                                console.log(fExtentsNum)
                                console.log(fId)
                                DSS.layer.runoff_field = new ol.layer.Image({
                                    visible: false,
                                    opacity: 1,
                                    updateWhileAnimating: true,
                                    updateWhileInteracting: true,
                                    source: new ol.source.ImageStatic({
                                    url:'/static/grazescape/public/images/runoff'+ String(fId) + '_' + modelruntimeFromDB + '.png',
                                    imageExtent: fExtentsNum
                                    })
                                })
                                DSS.layer.runoff_field.set('name', 'runoff'+ String(fId));
                                DSS.layer.runoff_field.getSource().refresh();
                                DSS.layer.runoff_field.getSource().changed();
                                DSS.map.addLayer(DSS.layer.runoff_field)
                                var runoffGroupLayers = DSS.layer.runoffGroup.getLayers().getArray();
                                if(runoffGroupLayers.length == 0){
                                    runoffGroupLayers.push(DSS.layer.runoff_field);
                                }
                                else{
                                    for(l in runoffGroupLayers){
                                        console.log(runoffGroupLayers[l].values_.name)
                                        console.log(DSS.layer.runoff_field.values_.name)
                                        if(runoffGroupLayers[l].values_.name == DSS.layer.runoff_field.values_.name){
                                            const index = runoffGroupLayers.indexOf(runoffGroupLayers[l]);
                                            if(index > -1) {
                                                runoffGroupLayers.splice(index,1);
                                                console.log("SPLICED :" + DSS.layer.runoff_field.values_.name)
                                            }
                                            runoffGroupLayers.push(DSS.layer.runoff_field);
                                        }
                                    }
                                runoffGroupLayers.push(DSS.layer.runoff_field);
                                }
                                DSS.map.removeLayer(DSS.layer.runoff_field)
                            }
                        })
                    }
                    for (i in fArray){
                        DSS.layer.yieldGroup.getLayers().forEach(function(layer){
                            console.log(layer)
                            var gidFromName = layer.values_.name.slice(5)
                            console.log(gidFromName)
                            modelruntime = fArray[i].values_.model_time_stamp
                            console.log(modelruntime)
                            if (String(fArray[i].values_.gid)==gidFromName){
                                var extents = layer.values_.source.imageExtent_
                                //Use this form when you have unique model run ids.
                                layer.setSource(new ol.source.ImageStatic({
                                    url: '/static/grazescape/public/images/'+ layer.values_.name + '_'+ modelruntime + '.png',
                                    imageExtent: extents
                                }))
                                layer.getSource().changed();
                            }else{
                                modelruntimeFromDB = fArray[i].values_.model_time_stamp
                                fExtents = fArray[i].values_.geometry.extent_
                                for(e in fExtents){
                                    console.log(fExtents[e])
                                    console.log(typeof fExtents[e])
                                    fExtents[e] = parseFloat(fExtents[e]).toFixed(4)
                                }
                                fExtentsNum = fExtents.map(Number);
                                var fId = fArray[i].values_.gid
                                console.log(fExtentsNum)
                                console.log(fId)
                                DSS.layer.yield_field = new ol.layer.Image({
                                    visible: false,
                                    opacity: 1,
                                    updateWhileAnimating: true,
                                    updateWhileInteracting: true,
                                    source: new ol.source.ImageStatic({
                                    url:'/static/grazescape/public/images/yield'+ String(fId) + '_' + modelruntimeFromDB + '.png',
                                    imageExtent: fExtentsNum
                                    })
                                })
                                DSS.layer.yield_field.set('name', 'yield'+ String(fId));
                                DSS.layer.yield_field.getSource().refresh();
                                DSS.layer.yield_field.getSource().changed();
                                DSS.map.addLayer(DSS.layer.yield_field)
                                var yieldGroupLayers = DSS.layer.yieldGroup.getLayers().getArray();
                                if(yieldGroupLayers.length == 0){
                                    yieldGroupLayers.push(DSS.layer.yield_field);
                                }
                                else{
                                    for(l in yieldGroupLayers){
                                        console.log(yieldGroupLayers[l].values_.name)
                                        console.log(DSS.layer.yield_field.values_.name)
                                        if(yieldGroupLayers[l].values_.name == DSS.layer.yield_field.values_.name){
                                            const index = yieldGroupLayers.indexOf(yieldGroupLayers[l]);
                                            if(index > -1) {
                                                yieldGroupLayers.splice(index,1);
                                                console.log("SPLICED :" + DSS.layer.yield_field.values_.name)
                                            }
                                            yieldGroupLayers.push(DSS.layer.yield_field);
                                        }
                                    }
                                yieldGroupLayers.push(DSS.layer.yield_field);
                                }
                                DSS.map.removeLayer(DSS.layer.yield_field)
                            }
                        })
                    }
                    Ext.ComponentQuery.query('window[name="dashboardWindow"]')[0].setHeight('40%')
                    Ext.ComponentQuery.query('window[name="dashboardWindow"]')[0].setWidth('60%')
                }
            },
            //--------------------------------------DEACTIVATED-----------------------------------
            deactivate: function() {
                Ext.ComponentQuery.query('window[name="dashboardWindow"]')[0].setHeight('80%');
                Ext.ComponentQuery.query('window[name="dashboardWindow"]')[0].setWidth('90%')
                DSS.MapState.destroyLegend();
                DSS.layer.PLossGroup.getLayers().forEach(function(layer){
                    layer.setVisible(false)
                    //layer.setSource(null)
                })
                DSS.layer.erosionGroup.getLayers().forEach(function(layer){
                    layer.setVisible(false)
                    //layer.setSource(null)
                })
                DSS.layer.nleachingGroup.getLayers().forEach(function(layer){
                    layer.setVisible(false)
                    //layer.setSource(null)
                })
                DSS.layer.runoffGroup.getLayers().forEach(function(layer){
                    layer.setVisible(false)
                    //layer.setSource(null)
                })
                DSS.layer.yieldGroup.getLayers().forEach(function(layer){
                    layer.setVisible(false)
                    //layer.setSource(null)
                })
                DSS.layer.yieldGroup.setVisible(false);
                DSS.layer.erosionGroup.setVisible(false);
                DSS.layer.nleachingGroup.setVisible(false);
                DSS.layer.runoffGroup.setVisible(false);
                DSS.layer.PLossGroup.setVisible(false);
                DSS.layer.PLossGroup.values_.layers.array_ = [];
				DSS.layer.erosionGroup.values_.layers.array_ = [];
                DSS.layer.nleachingGroup.values_.layers.array_ = [];
				DSS.layer.yieldGroup.values_.layers.array_ = [];
				DSS.layer.runoffGroup.values_.layers.array_ = [];
            }},
//                inner tabs for farm and field scale
            items:[
            {
				xtype: 'radiogroup',
                title: '<i class="fas fa-warehouse"></i>  Farm',
					columns: 1, 
					vertical: true,
					collapsible: true,
					defaults: {
						padding: '2 0',
						group: 'input-layer'
					},
					items: [
						{
							boxLabel: 'Phosphorus Loss',
							listeners:{change: async function()
								{
									if(this.checked){
										console.log('Ploss clicked')
                                        DSS.MapState.showContinuousLegend(pLossColorArray, pLossValueArray,'lbs/acre');
                                        await DSS.layer.PLossGroup.getLayers().forEach(function(layer){
                                            layer.setVisible(true);
                                            layer.getSource().changed();
                                            layer.getSource().refresh();
                                            //layer.setVisible(true);
                                        });
                                        DSS.layer.PLossGroup.setVisible(true);
                                        //To FORCE a redraw of the map
                                        DSS.map.getView().setZoom(DSS.map.getView().getZoom() - 1)
                                        setTimeout(() => {DSS.map.getView().setZoom(DSS.map.getView().getZoom() + 1)}, 90);
                                        //setTimeout(DSS.map.getView().setZoom(DSS.map.getView().getZoom() + 1),500)
                                        
									}
									else{
										DSS.layer.PLossGroup.setVisible(false);
									}
								}
							}
						},
                        {
							boxLabel: 'Erosion',
							listeners:{change: async function(checked)
								{
									if(this.checked){
										console.log('Erosion clicked')
                                        DSS.MapState.showContinuousLegend(pLossColorArray, pLossValueArray,'tons/acre');
                                        await DSS.layer.erosionGroup.getLayers().forEach(function(layer){
                                            layer.setVisible(true);
                                            layer.getSource().changed();
                                            layer.getSource().refresh();
                                        })
                                        DSS.layer.erosionGroup.setVisible(true);
                                        //To FORCE a redraw of the map
                                        DSS.map.getView().setZoom(DSS.map.getView().getZoom() - 1)
                                        setTimeout(() => {DSS.map.getView().setZoom(DSS.map.getView().getZoom() + 1)}, 90);
									}
									else{
										DSS.layer.erosionGroup.setVisible(false);
									}
								}
							}
						},
                        // {
						// 	boxLabel: 'Nitrate Leaching',
						// 	listeners:{change: async function(checked)
						// 		{
						// 			if(this.checked){
						// 				console.log('Nitrate clicked')
                        //                 DSS.MapState.showContinuousLegend(pLossColorArray, pLossValueArray,'lbs/acre');
                        //                 await DSS.layer.nleachingGroup.getLayers().forEach(function(layer){
                        //                     layer.setVisible(true);
                        //                     layer.getSource().changed();
                        //                     layer.getSource().refresh();
                        //                 })
                        //                 DSS.layer.nleachingGroup.setVisible(true);
                        //                 //To FORCE a redraw of the map
                        //                 DSS.map.getView().setZoom(DSS.map.getView().getZoom() - 1)
                        //                 setTimeout(() => {DSS.map.getView().setZoom(DSS.map.getView().getZoom() + 1)}, 90);
						// 			}
						// 			else{
						// 				DSS.layer.nleachingGroup.setVisible(false);
						// 			}
						// 		}
						// 	}
						// },

                        // {
						// 	boxLabel: 'Runoff',
						// 	listeners:{change: async function(checked)
						// 		{
						// 			if(this.checked){
						// 				console.log('Runoff clicked')
                        //                 //DSS.MapState.showContinuousLegend(pLossColorArray, pLossValueArray);
                        //                 DSS.MapState.destroyLegend();
                        //                 console.log(DSS.layer.yieldGroup)
                        //                 DSS.layer.runoffGroup.setVisible(true);
                        //                 DSS.layer.runoffGroup.setVisible(false);
                        //                 await DSS.layer.runoffGroup.getLayers().forEach(function(layer){
                                                //layer.setVisible(true);
                        //                     layer.getSource().changed();
                        //                     layer.getSource().refresh();
                        //                 })
                        //                 DSS.layer.runoffGroup.setVisible(true);
                        //                 //To FORCE a redraw of the map
                        //                 DSS.map.getView().setZoom(DSS.map.getView().getZoom() - 1)
                        //                 setTimeout(() => {DSS.map.getView().setZoom(DSS.map.getView().getZoom() + 1)}, 75);
						// 			}
						// 			else{
						// 				DSS.layer.runoffGroup.setVisible(false);
						// 			}
						// 		}
						// 	}
						// },
						{
							boxLabel: 'Yield',
							listeners:{change: async function(checked)
								{
									if(this.checked){
										console.log('Yield clicked')
                                        //DSS.MapState.showContinuousLegend(pLossColorArray, pLossValueArray);
                                        DSS.MapState.destroyLegend();
                                        console.log(DSS.layer.yieldGroup)
                                        await DSS.layer.yieldGroup.getLayers().forEach(function(layer){
                                            layer.setVisible(true);
                                            layer.getSource().changed();
                                            layer.getSource().refresh();
                                        })
                                        DSS.layer.yieldGroup.setVisible(true);
                                        //To FORCE a redraw of the map
                                        DSS.map.getView().setZoom(DSS.map.getView().getZoom() - 1)
                                        setTimeout(() => {DSS.map.getView().setZoom(DSS.map.getView().getZoom() + 1)}, 90);
									}
									else{
										DSS.layer.yieldGroup.setVisible(false);
									}
								}
							}
						},
						{
							boxLabel: 'No Output Overlay', 
							listeners:{change: function(checked)
								{
									if(this.checked){
                                        turnOffMappedResults()
									}
								}
							}
						},
                        
                        {
                            xtype: 'label',
                            cls: 'information med-text',
                            html: 'Yield only shows where each field has the best and worst production.  '
                        },
                        {
                            xtype: 'label',
                            cls: 'information med-text',
                            text: 'RED ',
                            style:{
                                color: 'red'
                            }
                        },
                        {
                            xtype: 'label',
                            cls: 'information med-text',
                            text: 'indicates higher yields, '
                        },
                        {
                            xtype: 'label',
                            cls: 'information med-text',
                            text: 'BLUE ',
                            style:{
                                color: 'blue'
                            }
                        },
                        {
                            xtype: 'label',
                            cls: 'information med-text',
                            html: 'indicates lower yields.' //\n* CAUTION * P loss estimates are derived from SnapPlus and originally intended to represent field scale P losses; sub-field variability is only shown for illustration purposes'
                        } 
					]
			},]
            
        }    
        var phantom = { title: 'Model Select',
                plain: true,
                hidden:true,
                tabConfig:{
//                    tooltip: "Control options and visibility of charts",
//                    cls: "myBar"
                },
//                tabBar : {
//                    layout: {
//                        pack: 'center',
//                            //background: '#C81820',
//                     }
//                 },
                xtype: 'container',
//                style: 'background-color: #377338;',
                html: '<div class = "center">Please click a tab on the left panel. As model runs complete more tabs will be available to select.</div><div id = "modelSpinner" class="loader"></div>',
                defaults: {
                   border:false,
                    bodyBorder: false
                },
                scrollable: true,
            }

//		Main tab panel
        let tabs = Ext.create('Ext.tab.Panel', {
            plain: true,
            tabPosition: 'left',
            id: 'mainTab',
//            disabled:true,
            tabBar : {
                    layout: {
                        pack: 'start',
                            //background: '#C81820',
                     },
//                     title: 'Custom Title',
//                    tooltip: 'A button tooltip',
                    margin: '20 0 0 0'
                 },

            height: '99%',
            width:'100%',
            tabRotation: 0,
            titleRotation:2,
            
//            background is apparently an image
            style: 'border-radius: 8px; background-color: #377338;box-shadow: 0 3px 6px rgba(0,0,0,0.2)',
            listeners: {change:function()
            {
                console.log('Hi from layers button')
            },
            enable: function(){
                console.log("ENABLE")
            },
            afterrender: function(){
                console.log("afterrender")
            },
            added: function(){
                console.log("ADDED")
            },
            add: function(){
                console.log("ADD")
            },
            hide: function(){
                console.log("hide")
                turnOffMappedResults()
            },
            beforehide: function(){
                console.log("beforehide")
                turnOffMappedResults()
            },
            close: function(){
                console.log("close")
                turnOffMappedResults()
            },},
            beforeclose: function(){
                console.log("beforeclose")
                turnOffMappedResults()
            },
//                inner tabs for farm and field scale
            items: [
                phantom,
                //summaryTable,
                //summary,
                yield,
                erosion,
                nutrients,
                //nitrate,
                runoff,
                //feedoutput,
                bio,
                economics,
                //infrastructure,
                compare,
                outputLayers,
                summary,
                //options,
           ],
           //activeTab: summaryTable,
        })

		Ext.applyIf(me, {

		    items: [{
				xtype: 'container',
				id: 'dashboardContainer',
				alwaysOnTop: true,
				style: 'background-color: #E2EAAC; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); border-top-color:rgba(255,255,255,0.25); border-bottom-color:rgba(0,0,0,0.3); box-shadow: 0 3px 6px rgba(0,0,0,0)',
				layout: DSS.utils.layout('vbox', 'start', 'stretch'),
				margin: '2 2',
				padding: '10 8 10 8',
//				height: '80%',
				defaults: {
					DSS_parent: me,
				},
				items: [{
                        xtype: 'component',
                        cls: 'information accent-text text-drp-20',
//                        html: 'Fence Settings',
                    },
                        tabs
                ]
			}]

		});

		me.callParent(arguments);

		AppEvents.registerListener("viewport_resize", function(opts) {
			me.center();
		})
	},
           listeners:{activate: function() {
//		                 populate this for each chart

            }
           }


});
