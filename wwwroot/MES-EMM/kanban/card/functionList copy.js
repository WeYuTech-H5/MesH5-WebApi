let meterdataSID1 = "346413515486994" // MSB-ATS
let meterdataSID2 = "352742169826514" // TPPLV
let meterdataSID3 = "352743097710714" // ACB2
let meterdataSID4 = "352743117216603" // LV1-MAY
let meterdataSID5 = "352743162066412" // LV1-MAY-ATS
let meterdataSID6 = '353408694466488' // ACB1
let meterdataSID7 = '353953432410897' // MP1
let meterdataSID8 = '353953449686186' // MP2
let meterdataSID9 = '353953464153638' // ACMP

let mainItem = {}

async function fetchData() {
    // MSB-ATS
    let meterdata1 = await getGridData(meterdataSID1)

    mainItem['1'] = {}
    mainItem['1']['EQP_NAME'] = meterdata1.Grid_Data[0].EQP_NAME
    meterdata1.Grid_Data.forEach(e => {
        mainItem['1'][e.AUTODC_ITEM] = e.AUTODC_OUTPUT
        if (e.AUTODC_ITEM === 'Freq') {
            mainItem['1']['EDIT_TIME'] = e.EDIT_TIME
        }
    })

    $('#mainEQPNO1').text(mainItem['1'].EQP_NAME)
    $('#kWhTotal1').text(mainItem['1'].kWh)
    $('#Voltage1').text(mainItem['1'].Avg_Voltage_LN)
    $('#Volt1').text(mainItem['1'].Avg_Volt_LL)
    $('#Current1').text(mainItem['1'].Avg_Current)
    $('#KWtotal1').html(mainItem['1'].Total_kW+ '<br />' + mainItem['1'].EDIT_TIME)
    $('#kVAtotal1').html(mainItem['1'].Total_kVA+ '<br />' + mainItem['1'].EDIT_TIME)
    $('#kVARtotal1').html(mainItem['1'].Total_kVAr+ '<br />' + mainItem['1'].EDIT_TIME)
    $('#avgPF1').text(mainItem['1'].Avg_PF)
    $('#Freq1').text(mainItem['1'].Freq)


    // TPPLV
    let meterdata2 = await getGridData(meterdataSID2)

    mainItem['2'] = {}
    mainItem['2']['EQP_NO'] = meterdata2.Grid_Data[0].EQP_NO
    meterdata2.Grid_Data.forEach(e => {
        mainItem['2'][e.AUTODC_ITEM] = e.AUTODC_OUTPUT
        if (e.AUTODC_ITEM === 'Freq') {
            mainItem['2']['EDIT_TIME'] = e.EDIT_TIME
        }
    })

    $('#mainEQPNO2').text(mainItem['2'].EQP_NO)
    $('#kWhTotal2').text(mainItem['2'].kWh)
    $('#Voltage2').text(mainItem['2'].Avg_Voltage_LN)
    $('#Volt2').text(mainItem['2'].Avg_Volt_LL)
    $('#Current2').text(mainItem['2'].Avg_Current)
    $('#KWtotal2').html(mainItem['2'].Total_kW+ '<br />' + mainItem['2'].EDIT_TIME)
    $('#kVAtotal2').html(mainItem['2'].Total_kVA+ '<br />' + mainItem['2'].EDIT_TIME)
    $('#kVARtotal2').html(mainItem['2'].Total_kVAr+ '<br />' + mainItem['2'].EDIT_TIME)
    $('#avgPF2').text(mainItem['2'].Avg_PF)
    $('#Freq2').text(mainItem['2'].Freq)


    // ACB2
    let meterdata3 = await getGridData(meterdataSID3)

    mainItem['3'] = {}
    mainItem['3']['EQP_NO'] = meterdata3.Grid_Data[0].EQP_NO
    meterdata3.Grid_Data.forEach(e => {
        mainItem['3'][e.AUTODC_ITEM] = e.AUTODC_OUTPUT
        if (e.AUTODC_ITEM === 'Freq') {
            mainItem['3']['EDIT_TIME'] = e.EDIT_TIME
        }
    })

    $('#mainEQPNO3').text(mainItem['3'].EQP_NO)
    $('#kWhTotal3').text(mainItem['3'].kWh)
    $('#Voltage3').text(mainItem['3'].Avg_Voltage_LN)
    $('#Volt3').text(mainItem['3'].Avg_Volt_LL)
    $('#Current3').text(mainItem['3'].Avg_Current)
    $('#KWtotal3').html(mainItem['3'].Total_kW+ '<br />' + mainItem['3'].EDIT_TIME)
    $('#kVAtotal3').html(mainItem['3'].Total_kVA+ '<br />' + mainItem['3'].EDIT_TIME)
    $('#kVARtotal3').html(mainItem['3'].Total_kVAr+ '<br />' + mainItem['3'].EDIT_TIME)
    $('#avgPF3').text(mainItem['3'].Avg_PF)
    $('#Freq3').text(mainItem['3'].Freq)


    // LV1-MAY
    let meterdata4 = await getGridData(meterdataSID4)

    mainItem['4'] = {}
    mainItem['4']['EQP_NO'] = meterdata4.Grid_Data[0].EQP_NO
    meterdata4.Grid_Data.forEach(e => {
        mainItem['4'][e.AUTODC_ITEM] = e.AUTODC_OUTPUT
        if (e.AUTODC_ITEM === 'Freq') {
            mainItem['4']['EDIT_TIME'] = e.EDIT_TIME
        }
    })

    $('#mainEQPNO4').text(mainItem['4'].EQP_NO)
    $('#kWhTotal4').text(mainItem['4'].kWh)
    $('#Voltage4').text(mainItem['4'].Avg_Voltage_LN)
    $('#Volt4').text(mainItem['4'].Avg_Volt_LL)
    $('#Current4').text(mainItem['4'].Avg_Current)
    $('#KWtotal4').html(mainItem['4'].Total_kW+ '<br />' + mainItem['4'].EDIT_TIME)
    $('#kVAtotal4').html(mainItem['4'].Total_kVA+ '<br />' + mainItem['4'].EDIT_TIME)
    $('#kVARtotal4').html(mainItem['4'].Total_kVAr+ '<br />' + mainItem['4'].EDIT_TIME)
    $('#avgPF4').text(mainItem['4'].Avg_PF)
    $('#Freq4').text(mainItem['4'].Freq)


    // LV1-MAY-ATS
    let meterdata5 = await getGridData(meterdataSID5)

    mainItem['5'] = {}
    mainItem['5']['EQP_NO'] = meterdata5.Grid_Data[0].EQP_NO
    meterdata5.Grid_Data.forEach(e => {
        mainItem['5'][e.AUTODC_ITEM] = e.AUTODC_OUTPUT
        if (e.AUTODC_ITEM === 'Freq') {
            mainItem['5']['EDIT_TIME'] = e.EDIT_TIME
        }
    })

    $('#mainEQPNO5').text(mainItem['5'].EQP_NO)
    $('#kWhTotal5').text(mainItem['5'].kWh)
    $('#Voltage5').text(mainItem['5'].Avg_Voltage_LN)
    $('#Volt5').text(mainItem['5'].Avg_Volt_LL)
    $('#Current5').text(mainItem['5'].Avg_Current)
    $('#KWtotal5').html(mainItem['5'].Total_kW+ '<br />' + mainItem['5'].EDIT_TIME)
    $('#kVAtotal5').html(mainItem['5'].Total_kVA+ '<br />' + mainItem['5'].EDIT_TIME)
    $('#kVARtotal5').html(mainItem['5'].Total_kVAr+ '<br />' + mainItem['5'].EDIT_TIME)
    $('#avgPF5').text(mainItem['5'].Avg_PF)
    $('#Freq5').text(mainItem['5'].Freq)

    // ACB1
    let meterdata6 = await getGridData(meterdataSID6)

    mainItem['6'] = {}
    mainItem['6']['EQP_NO'] = meterdata6.Grid_Data[0].EQP_NO
    meterdata6.Grid_Data.forEach(e => {
        mainItem['6'][e.AUTODC_ITEM] = e.AUTODC_OUTPUT
        if (e.AUTODC_ITEM === 'Freq') {
            mainItem['6']['EDIT_TIME'] = e.EDIT_TIME
        }
    })

    $('#mainEQPNO6').text(mainItem['6'].EQP_NO)
    $('#kWhTotal6').text(mainItem['6'].kWh)
    $('#Voltage6').text(mainItem['6'].Avg_Voltage_LN)
    $('#Volt6').text(mainItem['6'].Avg_Volt_LL)
    $('#Current6').text(mainItem['6'].Avg_Current)
    $('#KWtotal6').html(mainItem['6'].Total_kW+ '<br />' + mainItem['6'].EDIT_TIME)
    $('#kVAtotal6').html(mainItem['6'].Total_kVA+ '<br />' + mainItem['6'].EDIT_TIME)
    $('#kVARtotal6').html(mainItem['6'].Total_kVAr+ '<br />' + mainItem['6'].EDIT_TIME)
    $('#avgPF6').text(mainItem['6'].Avg_PF)
    $('#Freq6').text(mainItem['6'].Freq)

    // MP1
    let meterdata7 = await getGridData(meterdataSID7)

    mainItem['7'] = {}
    mainItem['7']['EQP_NO'] = meterdata7.Grid_Data[0].EQP_NO
    meterdata7.Grid_Data.forEach(e => {
        mainItem['7'][e.AUTODC_ITEM] = e.AUTODC_OUTPUT
        if (e.AUTODC_ITEM === 'Freq') {
            mainItem['7']['EDIT_TIME'] = e.EDIT_TIME
        }
    })

    $('#mainEQPNO7').text(mainItem['7'].EQP_NO)
    $('#kWhTotal7').text(mainItem['7'].kWh)
    $('#Voltage7').text(mainItem['7'].Avg_Voltage_LN)
    $('#Volt7').text(mainItem['7'].Avg_Volt_LL)
    $('#Current7').text(mainItem['7'].Avg_Current)
    $('#KWtotal7').html(mainItem['7'].Total_kW+ '<br />' + mainItem['7'].EDIT_TIME)
    $('#kVAtotal7').html(mainItem['7'].Total_kVA+ '<br />' + mainItem['7'].EDIT_TIME)
    $('#kVARtotal7').html(mainItem['7'].Total_kVAr+ '<br />' + mainItem['7'].EDIT_TIME)
    $('#avgPF7').text(mainItem['7'].Avg_PF)
    $('#Freq7').text(mainItem['7'].Freq)

    // MP2
    let meterdata8 = await getGridData(meterdataSID8)

    mainItem['8'] = {}
    mainItem['8']['EQP_NO'] = meterdata8.Grid_Data[0].EQP_NO
    meterdata8.Grid_Data.forEach(e => {
        mainItem['8'][e.AUTODC_ITEM] = e.AUTODC_OUTPUT
        if (e.AUTODC_ITEM === 'Freq') {
            mainItem['8']['EDIT_TIME'] = e.EDIT_TIME
        }
    })

    $('#mainEQPNO8').text(mainItem['8'].EQP_NO)
    $('#kWhTotal8').text(mainItem['8'].kWh)
    $('#Voltage8').text(mainItem['8'].Avg_Voltage_LN)
    $('#Volt8').text(mainItem['8'].Avg_Volt_LL)
    $('#Current8').text(mainItem['8'].Avg_Current)
    $('#KWtotal8').html(mainItem['8'].Total_kW+ '<br />' + mainItem['8'].EDIT_TIME)
    $('#kVAtotal8').html(mainItem['8'].Total_kVA+ '<br />' + mainItem['8'].EDIT_TIME)
    $('#kVARtotal8').html(mainItem['8'].Total_kVAr+ '<br />' + mainItem['8'].EDIT_TIME)
    $('#avgPF8').text(mainItem['8'].Avg_PF)
    $('#Freq8').text(mainItem['8'].Freq)

    // ACMP
    let meterdata9 = await getGridData(meterdataSID9)

    mainItem['9'] = {}
    mainItem['9']['EQP_NO'] = meterdata9.Grid_Data[0].EQP_NO
    meterdata9.Grid_Data.forEach(e => {
        mainItem['9'][e.AUTODC_ITEM] = e.AUTODC_OUTPUT
        if (e.AUTODC_ITEM === 'Freq') {
            mainItem['9']['EDIT_TIME'] = e.EDIT_TIME
        }
    })

    $('#mainEQPNO9').text(mainItem['9'].EQP_NO)
    $('#kWhTotal9').text(mainItem['9'].kWh)
    $('#Voltage9').text(mainItem['9'].Avg_Voltage_LN)
    $('#Volt9').text(mainItem['9'].Avg_Volt_LL)
    $('#Current9').text(mainItem['9'].Avg_Current)
    $('#KWtotal9').html(mainItem['9'].Total_kW+ '<br />' + mainItem['9'].EDIT_TIME)
    $('#kVAtotal9').html(mainItem['9'].Total_kVA+ '<br />' + mainItem['9'].EDIT_TIME)
    $('#kVARtotal9').html(mainItem['9'].Total_kVAr+ '<br />' + mainItem['9'].EDIT_TIME)
    $('#avgPF9').text(mainItem['9'].Avg_PF)
    $('#Freq9').text(mainItem['9'].Freq)
}

fetchData()