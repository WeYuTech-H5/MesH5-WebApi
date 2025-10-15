// 廠區
let meterdataSID1 = "355502596903623" // MAIN

// 電表
let meterdataSID2 = "355503471303356" // JV02
let meterdataSID3 = "355503626853227" // JV03
let meterdataSID4 = "355503759100726" // JV04
let meterdataSID5 = "346413515486994" // JA14
// let meterdataSID6 = "352742169826514" // TPPLV
// let meterdataSID7 = "352743097710714" // ACB2
// let meterdataSID8 = "352743117216603" // LV1-MAY
// let meterdataSID9 = "352743162066412" // LV1-MAY-ATS
// let meterdataSID10 = '353408694466488' // ACB1
// let meterdataSID11 = '353953432410897' // MP1
// let meterdataSID12 = '353953449686186' // MP2
// let meterdataSID13 = '353953464153638' // ACMP


let mainItem = {}

async function fetchData() {
    // YUANYANG
    let meterdata1 = await getGridData(meterdataSID1)

    mainItem['1'] = {}
    mainItem['1']['EQP_NO'] = meterdata1.Grid_Data[0].EQP_NO
    meterdata1.Grid_Data.forEach(e => {
        mainItem['1'][e.AUTODC_ITEM] = e.AUTODC_OUTPUT
        if (e.AUTODC_ITEM === 'Frequence') {
            mainItem['1']['EDIT_TIME'] = e.EDIT_TIME
        }
    })

    $('#mainEQPNO1').text(mainItem['1'].EQP_NO)
    $('#kWhTotal1').text(mainItem['1'].kW_total)
    $('#Voltage1').text(mainItem['1'].Vln_avg)
    $('#Volt1').text(mainItem['1'].Vll_avg)
    $('#Current1').text(mainItem['1'].I_avg)
    $('#KWtotal1').html(mainItem['1'].Day_max_kW)
    $('#kVAtotal1').html(mainItem['1'].kVA_tot)
    $('#kVARtotal1').html(mainItem['1'].kvar_tot)
    $('#avgPF1').text(mainItem['1'].PF_tot)
    $('#Freq1').text(mainItem['1'].Frequence)


    // JV02
    let meterdata2 = await getGridData(meterdataSID2)

    mainItem['2'] = {}
    mainItem['2']['EQP_NO'] = meterdata2.Grid_Data[0].EQP_NO
    meterdata2.Grid_Data.forEach(e => {
        mainItem['2'][e.AUTODC_ITEM] = e.AUTODC_OUTPUT
        if (e.AUTODC_ITEM === 'Frequence') {
            mainItem['2']['EDIT_TIME'] = e.EDIT_TIME
        }
    })

    $('#mainEQPNO2').text(mainItem['2'].EQP_NO)
    $('#kWhTotal2').text(mainItem['2'].kW_tot)
    $('#Voltage2').text(mainItem['2'].Vln_avg)
    $('#Volt2').text(mainItem['2'].Vll_avg)
    $('#Current2').text(mainItem['2'].I_avg)
    $('#KWtotal2').html(mainItem['2'].Day_max_kW)
    $('#kVAtotal2').html(mainItem['2'].kVA_tot)
    $('#kVARtotal2').html(mainItem['2'].kvar_tot)
    $('#avgPF2').text(mainItem['2'].PF_tot)
    $('#Freq2').text(mainItem['2'].Frequence)


    // JV03
    let meterdata3 = await getGridData(meterdataSID3)

    mainItem['3'] = {}
    mainItem['3']['EQP_NO'] = meterdata3.Grid_Data[0].EQP_NO
    meterdata3.Grid_Data.forEach(e => {
        mainItem['3'][e.AUTODC_ITEM] = e.AUTODC_OUTPUT
        if (e.AUTODC_ITEM === 'Frequence') {
            mainItem['3']['EDIT_TIME'] = e.EDIT_TIME
        }
    })

    $('#mainEQPNO3').text(mainItem['3'].EQP_NO)
    $('#kWhTotal3').text(mainItem['3'].kW_tot)
    $('#Voltage3').text(mainItem['3'].Vln_avg)
    $('#Volt3').text(mainItem['3'].Vll_avg)
    $('#Current3').text(mainItem['3'].I_avg)
    $('#KWtotal3').html(mainItem['3'].Day_max_kW)
    $('#kVAtotal3').html(mainItem['3'].kVA_tot)
    $('#kVARtotal3').html(mainItem['3'].kvar_tot)
    $('#avgPF3').text(mainItem['3'].PF_tot)
    $('#Freq3').text(mainItem['3'].Frequence)

    // JV04
    let meterdata4 = await getGridData(meterdataSID4)

    mainItem['4'] = {}
    mainItem['4']['EQP_NO'] = meterdata4.Grid_Data[0].EQP_NO
    meterdata4.Grid_Data.forEach(e => {
        mainItem['4'][e.AUTODC_ITEM] = e.AUTODC_OUTPUT
        if (e.AUTODC_ITEM === 'Frequence') {
            mainItem['4']['EDIT_TIME'] = e.EDIT_TIME
        }
    })

    $('#mainEQPNO4').text(mainItem['4'].EQP_NO)
    $('#kWhTotal4').text(mainItem['4'].kW_tot)
    $('#Voltage4').text(mainItem['4'].Vln_avg)
    $('#Volt4').text(mainItem['4'].Vll_avg)
    $('#Current4').text(mainItem['4'].I_avg)
    $('#KWtotal4').html(mainItem['4'].Day_max_kW)
    $('#kVAtotal4').html(mainItem['4'].kVA_tot)
    $('#kVARtotal4').html(mainItem['4'].kvar_tot)
    $('#avgPF4').text(mainItem['4'].PF_tot)
    $('#Freq4').text(mainItem['4'].Frequence)

    //---------------------------------------------------------------

    // JA14
    let meterdata5 = await getGridData(meterdataSID5)

    mainItem['5'] = {}
    mainItem['5']['EQP_NAME'] = meterdata5.Grid_Data[0].EQP_NAME
    meterdata5.Grid_Data.forEach(e => {
        mainItem['5'][e.AUTODC_ITEM] = e.AUTODC_OUTPUT
        if (e.AUTODC_ITEM === 'Frequence') {
            mainItem['5']['EDIT_TIME'] = e.EDIT_TIME
        }
    })

    $('#mainEQPNO5').text(mainItem['5'].EQP_NAME)
    $('#kWhTotal5').text(mainItem['5'].kW_tot)
    $('#Voltage5').text(mainItem['5'].Vln_avg)
    $('#Volt5').text(mainItem['5'].Vll_avg)
    $('#Current5').text(mainItem['5'].I_avg)
    $('#KWtotal5').html(mainItem['5'].Day_max_kW)
    $('#kVAtotal5').html(mainItem['5'].kVA_tot)
    $('#kVARtotal5').html(mainItem['5'].kvar_tot)
    $('#avgPF5').text(mainItem['5'].PF_tot)
    $('#Freq5').text(mainItem['5'].Frequence)

    // TPPLV
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

    // ACB2
    let meterdata7 = await getGridData(meterdataSID7)

    mainItem['7'] = {}
    mainItem['7']['EQP_NAME'] = meterdata7.Grid_Data[0].EQP_NAME
    meterdata7.Grid_Data.forEach(e => {
        mainItem['7'][e.AUTODC_ITEM] = e.AUTODC_OUTPUT
        if (e.AUTODC_ITEM === 'Freq') {
            mainItem['7']['EDIT_TIME'] = e.EDIT_TIME
        }
    })

    $('#mainEQPNO7').text(mainItem['7'].EQP_NAME.slice(-4))
    $('#kWhTotal7').text(mainItem['7'].kWh)
    $('#Voltage7').text(mainItem['7'].Avg_Voltage_LN)
    $('#Volt7').text(mainItem['7'].Avg_Volt_LL)
    $('#Current7').text(mainItem['7'].Avg_Current)
    $('#KWtotal7').html(mainItem['7'].Total_kW+ '<br />' + mainItem['7'].EDIT_TIME)
    $('#kVAtotal7').html(mainItem['7'].Total_kVA+ '<br />' + mainItem['7'].EDIT_TIME)
    $('#kVARtotal7').html(mainItem['7'].Total_kVAr+ '<br />' + mainItem['7'].EDIT_TIME)
    $('#avgPF7').text(mainItem['7'].Avg_PF)
    $('#Freq7').text(mainItem['7'].Freq)

    // LV1-MAY
    let meterdata8 = await getGridData(meterdataSID8)

    mainItem['8'] = {}
    mainItem['8']['EQP_NAME'] = meterdata8.Grid_Data[0].EQP_NAME
    meterdata8.Grid_Data.forEach(e => {
        mainItem['8'][e.AUTODC_ITEM] = e.AUTODC_OUTPUT
        if (e.AUTODC_ITEM === 'Freq') {
            mainItem['8']['EDIT_TIME'] = e.EDIT_TIME
        }
    })

    $('#mainEQPNO8').text(mainItem['8'].EQP_NAME.slice(-4))
    $('#kWhTotal8').text(mainItem['8'].kWh)
    $('#Voltage8').text(mainItem['8'].Avg_Voltage_LN)
    $('#Volt8').text(mainItem['8'].Avg_Volt_LL)
    $('#Current8').text(mainItem['8'].Avg_Current)
    $('#KWtotal8').html(mainItem['8'].Total_kW+ '<br />' + mainItem['8'].EDIT_TIME)
    $('#kVAtotal8').html(mainItem['8'].Total_kVA+ '<br />' + mainItem['8'].EDIT_TIME)
    $('#kVARtotal8').html(mainItem['8'].Total_kVAr+ '<br />' + mainItem['8'].EDIT_TIME)
    $('#avgPF8').text(mainItem['8'].Avg_PF)
    $('#Freq8').text(mainItem['8'].Freq)

    // LV1-MAY-ATS
    let meterdata9 = await getGridData(meterdataSID9)

    mainItem['9'] = {}
    mainItem['9']['EQP_NAME'] = meterdata9.Grid_Data[0].EQP_NAME
    meterdata9.Grid_Data.forEach(e => {
        mainItem['9'][e.AUTODC_ITEM] = e.AUTODC_OUTPUT
        if (e.AUTODC_ITEM === 'Freq') {
            mainItem['9']['EDIT_TIME'] = e.EDIT_TIME
        }
    })

    $('#mainEQPNO9').text(mainItem['9'].EQP_NAME.slice(-4))
    $('#kWhTotal9').text(mainItem['9'].kWh)
    $('#Voltage9').text(mainItem['9'].Avg_Voltage_LN)
    $('#Volt9').text(mainItem['9'].Avg_Volt_LL)
    $('#Current9').text(mainItem['9'].Avg_Current)
    $('#KWtotal9').html(mainItem['9'].Total_kW+ '<br />' + mainItem['9'].EDIT_TIME)
    $('#kVAtotal9').html(mainItem['9'].Total_kVA+ '<br />' + mainItem['9'].EDIT_TIME)
    $('#kVARtotal9').html(mainItem['9'].Total_kVAr+ '<br />' + mainItem['9'].EDIT_TIME)
    $('#avgPF9').text(mainItem['9'].Avg_PF)
    $('#Freq9').text(mainItem['9'].Freq)

    // ACB1
    let meterdata10 = await getGridData(meterdataSID10)

    mainItem['10'] = {}
    mainItem['10']['EQP_NAME'] = meterdata10.Grid_Data[0].EQP_NAME
    meterdata9.Grid_Data.forEach(e => {
        mainItem['10'][e.AUTODC_ITEM] = e.AUTODC_OUTPUT
        if (e.AUTODC_ITEM === 'Freq') {
            mainItem['10']['EDIT_TIME'] = e.EDIT_TIME
        }
    })

    $('#mainEQPNO10').text(mainItem['10'].EQP_NAME.slice(-4))
    $('#kWhTotal10').text(mainItem['10'].kWh)
    $('#Voltage10').text(mainItem['10'].Avg_Voltage_LN)
    $('#Volt10').text(mainItem['10'].Avg_Volt_LL)
    $('#Current10').text(mainItem['10'].Avg_Current)
    $('#KWtotal10').html(mainItem['10'].Total_kW+ '<br />' + mainItem['10'].EDIT_TIME)
    $('#kVAtotal10').html(mainItem['10'].Total_kVA+ '<br />' + mainItem['10'].EDIT_TIME)
    $('#kVARtotal10').html(mainItem['10'].Total_kVAr+ '<br />' + mainItem['10'].EDIT_TIME)
    $('#avgPF10').text(mainItem['10'].Avg_PF)
    $('#Freq10').text(mainItem['10'].Freq)

    // MP1
    let meterdata11 = await getGridData(meterdataSID11)

    mainItem['11'] = {}
    mainItem['11']['EQP_NO'] = meterdata11.Grid_Data[0].EQP_NO
    meterdata9.Grid_Data.forEach(e => {
        mainItem['11'][e.AUTODC_ITEM] = e.AUTODC_OUTPUT
        if (e.AUTODC_ITEM === 'Freq') {
            mainItem['11']['EDIT_TIME'] = e.EDIT_TIME
        }
    })

    $('#mainEQPNO11').text(mainItem['11'].EQP_NO)
    $('#kWhTotal11').text(mainItem['11'].kWh)
    $('#Voltage11').text(mainItem['11'].Avg_Voltage_LN)
    $('#Volt11').text(mainItem['11'].Avg_Volt_LL)
    $('#Current11').text(mainItem['11'].Avg_Current)
    $('#KWtotal11').html(mainItem['11'].Total_kW+ '<br />' + mainItem['11'].EDIT_TIME)
    $('#kVAtotal11').html(mainItem['11'].Total_kVA+ '<br />' + mainItem['11'].EDIT_TIME)
    $('#kVARtotal11').html(mainItem['11'].Total_kVAr+ '<br />' + mainItem['11'].EDIT_TIME)
    $('#avgPF11').text(mainItem['11'].Avg_PF)
    $('#Freq11').text(mainItem['11'].Freq)

    // MP2
    let meterdata12 = await getGridData(meterdataSID12)

    mainItem['12'] = {}
    mainItem['12']['EQP_NO'] = meterdata12.Grid_Data[0].EQP_NO
    meterdata9.Grid_Data.forEach(e => {
        mainItem['12'][e.AUTODC_ITEM] = e.AUTODC_OUTPUT
        if (e.AUTODC_ITEM === 'Freq') {
            mainItem['12']['EDIT_TIME'] = e.EDIT_TIME
        }
    })

    $('#mainEQPNO12').text(mainItem['12'].EQP_NO)
    $('#kWhTotal12').text(mainItem['12'].kWh)
    $('#Voltage12').text(mainItem['12'].Avg_Voltage_LN)
    $('#Volt12').text(mainItem['12'].Avg_Volt_LL)
    $('#Current12').text(mainItem['12'].Avg_Current)
    $('#KWtotal12').html(mainItem['12'].Total_kW+ '<br />' + mainItem['12'].EDIT_TIME)
    $('#kVAtotal12').html(mainItem['12'].Total_kVA+ '<br />' + mainItem['12'].EDIT_TIME)
    $('#kVARtotal12').html(mainItem['12'].Total_kVAr+ '<br />' + mainItem['12'].EDIT_TIME)
    $('#avgPF12').text(mainItem['12'].Avg_PF)
    $('#Freq12').text(mainItem['12'].Freq)

    // ACMP
    let meterdata13 = await getGridData(meterdataSID13)

    mainItem['13'] = {}
    mainItem['13']['EQP_NO'] = meterdata13.Grid_Data[0].EQP_NO
    meterdata9.Grid_Data.forEach(e => {
        mainItem['13'][e.AUTODC_ITEM] = e.AUTODC_OUTPUT
        if (e.AUTODC_ITEM === 'Freq') {
            mainItem['13']['EDIT_TIME'] = e.EDIT_TIME
        }
    })

    $('#mainEQPNO13').text(mainItem['13'].EQP_NO)
    $('#kWhTotal13').text(mainItem['13'].kWh)
    $('#Voltage13').text(mainItem['13'].Avg_Voltage_LN)
    $('#Volt13').text(mainItem['13'].Avg_Volt_LL)
    $('#Current13').text(mainItem['13'].Avg_Current)
    $('#KWtotal13').html(mainItem['13'].Total_kW+ '<br />' + mainItem['13'].EDIT_TIME)
    $('#kVAtotal13').html(mainItem['13'].Total_kVA+ '<br />' + mainItem['13'].EDIT_TIME)
    $('#kVARtotal13').html(mainItem['13'].Total_kVAr+ '<br />' + mainItem['13'].EDIT_TIME)
    $('#avgPF13').text(mainItem['13'].Avg_PF)
    $('#Freq13').text(mainItem['13'].Freq)
}
fetchData()

function dateTime() {
    const now = new Date()
    const dateTimeNow = now.getFullYear() + '-' +
    String(now.getMonth() + 1).padStart(2, '0') + '-' + 
    String(now.getDate()).padStart(2, '0') + ' ' + 
    String(now.getHours()).padStart(2, '0') + ':' + 
    String(now.getMinutes()).padStart(2, '0') + ':' + 
    String(now.getSeconds()).padStart(2, '0')
    $('#dateTime').text(dateTimeNow)
}

setInterval(dateTime, 1000)

dateTime()