let meterdataSID1 = "355142006246817" // FAB1-AIR-FLOW
let meterdataSID2 = "355143046453914" // FAB1-N-FLOW
let meterdataSID3 = "355143199180294" // FAB2-AIR-FLOW
let meterdataSID4 = "355143568560185" // FAB2-N-FLOW
let meterdataSID5 = "355143813136953" // FAB3-AIR-FLOW
let meterdataSID6 = '355147755883163' // FAB3-N-FLOW

let meterdataSID7 = '356712011373702' // AIR-FLOW-GEMTEK
let meterdataSID8 = '356715007476354' // N-FLOW-GEMTEK

let mainItem = {}

async function fetchData() {
    // FAB1-AIR-FLOW
    let meterdata1 = await getGridData(meterdataSID1)

    mainItem['1'] = {}
    mainItem['1']['EQP_NO'] = meterdata1.Grid_Data[0].EQP_NO
    meterdata1.Grid_Data.forEach(e => {
        mainItem['1'][e.AUTODC_ITEM] = e.AUTODC_OUTPUT
        if (e.AUTODC_ITEM === 'Degree') {
            mainItem['1']['EDIT_TIME'] = e.EDIT_TIME
        }
    })

    $('#mainEQPNO1').text(mainItem['1'].EQP_NO)
    $('#Temp1').text(mainItem['1'].Temperature)
    $('#Pressure1').text(mainItem['1'].Pressure)
    $('#Freq1').text(mainItem['1'].Frequency)
    $('#Flow1').text(mainItem['1'].Flow)
    $('#Degree1').html(mainItem['1'].Degree+ '<br />' +mainItem['1'].EDIT_TIME)


    // FAB1-N-FLOW
    let meterdata2 = await getGridData(meterdataSID2)

    mainItem['2'] = {}
    mainItem['2']['EQP_NO'] = meterdata2.Grid_Data[0].EQP_NO
    meterdata2.Grid_Data.forEach(e => {
        mainItem['2'][e.AUTODC_ITEM] = e.AUTODC_OUTPUT
        if (e.AUTODC_ITEM === 'Degree') {
            mainItem['2']['EDIT_TIME'] = e.EDIT_TIME
        }
    })

    $('#mainEQPNO2').text(mainItem['2'].EQP_NO)
    $('#Temp2').text(mainItem['2'].Temperature)
    $('#Pressure2').text(mainItem['2'].Pressure)
    $('#Freq2').text(mainItem['2'].Frequency)
    $('#Flow2').text(mainItem['2'].Flow)
    $('#Degree2').html(mainItem['2'].Degree+ '<br />' +mainItem['2'].EDIT_TIME)



    // FAB2-AIR-FLOW
    let meterdata3 = await getGridData(meterdataSID3)

    mainItem['3'] = {}
    mainItem['3']['EQP_NO'] = meterdata3.Grid_Data[0].EQP_NO
    meterdata3.Grid_Data.forEach(e => {
        mainItem['3'][e.AUTODC_ITEM] = e.AUTODC_OUTPUT
        if (e.AUTODC_ITEM === 'Degree') {
            mainItem['3']['EDIT_TIME'] = e.EDIT_TIME
        }
    })

    $('#mainEQPNO3').text(mainItem['3'].EQP_NO)
    $('#Temp3').text(mainItem['3'].Temperature)
    $('#Pressure3').text(mainItem['3'].Pressure)
    $('#Freq3').text(mainItem['3'].Frequency)
    $('#Flow3').text(mainItem['3'].Flow)
    $('#Degree3').html(mainItem['3'].Degree+ '<br />' +mainItem['3'].EDIT_TIME)


    // FAB2-N-FLOW
    let meterdata4 = await getGridData(meterdataSID4)

    mainItem['4'] = {}
    mainItem['4']['EQP_NO'] = meterdata4.Grid_Data[0].EQP_NO
    meterdata4.Grid_Data.forEach(e => {
        mainItem['4'][e.AUTODC_ITEM] = e.AUTODC_OUTPUT
        if (e.AUTODC_ITEM === 'Degree') {
            mainItem['4']['EDIT_TIME'] = e.EDIT_TIME
        }
    })

    $('#mainEQPNO4').text(mainItem['4'].EQP_NO)
    $('#Temp4').text(mainItem['4'].Temperature)
    $('#Pressure4').text(mainItem['4'].Pressure)
    $('#Freq4').text(mainItem['4'].Frequency)
    $('#Flow4').text(mainItem['4'].Flow)
    $('#Degree4').html(mainItem['4'].Degree+ '<br />' +mainItem['4'].EDIT_TIME)


    // FAB3-AIR-FLOW
    let meterdata5 = await getGridData(meterdataSID5)

    mainItem['5'] = {}
    mainItem['5']['EQP_NO'] = meterdata5.Grid_Data[0].EQP_NO
    meterdata5.Grid_Data.forEach(e => {
        mainItem['5'][e.AUTODC_ITEM] = e.AUTODC_OUTPUT
        if (e.AUTODC_ITEM === 'Degree') {
            mainItem['5']['EDIT_TIME'] = e.EDIT_TIME
        }
    })

    $('#mainEQPNO5').text(mainItem['5'].EQP_NO)
    $('#Temp5').text(mainItem['5'].Temperature)
    $('#Pressure5').text(mainItem['5'].Pressure)
    $('#Freq5').text(mainItem['5'].Frequency)
    $('#Flow5').text(mainItem['5'].Flow)
    $('#Degree5').html(mainItem['5'].Degree+ '<br />' +mainItem['5'].EDIT_TIME)

    // FAB3-N-FLOW
    let meterdata6 = await getGridData(meterdataSID6)

    mainItem['6'] = {}
    mainItem['6']['EQP_NO'] = meterdata6.Grid_Data[0].EQP_NO
    meterdata6.Grid_Data.forEach(e => {
        mainItem['6'][e.AUTODC_ITEM] = e.AUTODC_OUTPUT
        if (e.AUTODC_ITEM === 'Degree') {
            mainItem['6']['EDIT_TIME'] = e.EDIT_TIME
        }
    })

    $('#mainEQPNO6').text(mainItem['6'].EQP_NO)
    $('#Temp6').text(mainItem['6'].Temperature)
    $('#Pressure6').text(mainItem['6'].Pressure)
    $('#Freq6').text(mainItem['6'].Frequency)
    $('#Flow6').text(mainItem['6'].Flow)
    $('#Degree6').html(mainItem['6'].Degree+ '<br />' +mainItem['6'].EDIT_TIME)


    // AIR-FLOW-GEMTEK
    let meterdata7 = await getGridData(meterdataSID7)

    mainItem['7'] = {}
    mainItem['7']['EQP_NO'] = meterdata7.Grid_Data[0].EQP_NO
    meterdata7.Grid_Data.forEach(e => {
        mainItem['7'][e.AUTODC_ITEM] = e.AUTODC_OUTPUT
        if (e.AUTODC_ITEM === 'Degree') {
            mainItem['7']['EDIT_TIME'] = e.EDIT_TIME
        }
    })

    $('#mainEQPNO7').text(mainItem['7'].EQP_NO)
    $('#Temp7').text(mainItem['7'].Temperature.toFixed(3))
    $('#Pressure7').text(mainItem['7'].Pressure.toFixed(3))
    $('#Freq7').text(mainItem['7'].Frequency.toFixed(3))
    $('#Flow7').text(mainItem['7'].Flow.toFixed(3))
    $('#Degree7').html(mainItem['7'].Degree.toFixed(3))

    // N-FLOW-GEMTEK
    let meterdata8 = await getGridData(meterdataSID8)

    mainItem['8'] = {}
    mainItem['8']['EQP_NO'] = meterdata8.Grid_Data[0].EQP_NO
    meterdata8.Grid_Data.forEach(e => {
        mainItem['8'][e.AUTODC_ITEM] = e.AUTODC_OUTPUT
        if (e.AUTODC_ITEM === 'Degree') {
            mainItem['8']['EDIT_TIME'] = e.EDIT_TIME
        }
    })

    $('#mainEQPNO8').text(mainItem['8'].EQP_NO)
    $('#Temp8').text(mainItem['8'].Temperature.toFixed(3))
    $('#Pressure8').text(mainItem['8'].Pressure.toFixed(3))
    $('#Freq8').text(mainItem['8'].Frequency.toFixed(3))
    $('#Flow8').text(mainItem['8'].Flow.toFixed(3))
    $('#Degree8').html(mainItem['8'].Degree.toFixed(3))

}

fetchData()