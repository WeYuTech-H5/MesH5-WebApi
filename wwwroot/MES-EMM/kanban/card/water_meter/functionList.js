let meterdataSID1 = "355064906620988" // FAB1-TAP-WATER
let meterdataSID2 = "355068219976509" // FAB2-TAP-WATER
let meterdataSID3 = "355068559850849" // FAB3-WASTE-WATER

let meterdataSID4 = '356716901426860' // TAP-WATER-GEMTEK
let meterdataSID5 = '356718427760173' // WASTE-WATER-GEMTEK

let mainItem = {}

async function fetchData() {
    // FAB1-TAP-WATER
    let meterdata1 = await getGridData(meterdataSID1)

    mainItem['1'] = {}
    mainItem['1']['EQP_NO'] = meterdata1.Grid_Data[0].EQP_NO
    meterdata1.Grid_Data.forEach(e => {
        mainItem['1'][e.AUTODC_ITEM] = e.AUTODC_OUTPUT
    })

    // $('#mainEQPNO1').text(mainItem['1'].EQP_NO)
    $('#Flowrate1').text(mainItem['1'].Flow_rate)
    $('#Velocity1').text(mainItem['1'].Fluid_velocity)

    const totalFlowPositive = (parseFloat(mainItem['1'].Total_flow_positive) || 0) + (parseFloat(mainItem['1'].Total_flow_positive_decimal) || 0);
    $('#FlowPositive1').text(totalFlowPositive.toFixed(3))


    // FAB2-TAP-WATER
    let meterdata2 = await getGridData(meterdataSID2)

    mainItem['2'] = {}
    mainItem['2']['EQP_NO'] = meterdata2.Grid_Data[0].EQP_NO
    meterdata2.Grid_Data.forEach(e => {
        mainItem['2'][e.AUTODC_ITEM] = e.AUTODC_OUTPUT
    })

    $('#mainEQPNO2').text(mainItem['2'].EQP_NO)
    $('#Flowrate2').text(mainItem['2'].Flow_rate)
    $('#Velocity2').text(mainItem['2'].Fluid_velocity)

    const totalFlowPositive2 = (parseFloat(mainItem['2'].Total_flow_positive) || 0) + (parseFloat(mainItem['2'].Total_flow_positive_decimal) || 0);
    $('#FlowPositive2').text(totalFlowPositive2.toFixed(3))



    // FAB3-WASTE-WATER
    let meterdata3 = await getGridData(meterdataSID3)

    mainItem['3'] = {}
    mainItem['3']['EQP_NO'] = meterdata3.Grid_Data[0].EQP_NO
    meterdata3.Grid_Data.forEach(e => {
        mainItem['3'][e.AUTODC_ITEM] = e.AUTODC_OUTPUT
    })

    $('#mainEQPNO3').text(mainItem['3'].EQP_NO)
    $('#Flowrate3').text(mainItem['3'].Flow_rate)
    $('#Velocity3').text(mainItem['3'].Velocity)

    const totalFlowPositive3 = (parseFloat(mainItem['3'].Total_flow) || 0) + (parseFloat(mainItem['3'].Total_flow_dec) || 0);
    $('#FlowPositive3').text(totalFlowPositive3.toFixed(3))

    // TAP-WATER-GEMTEK
    let meterdata4 = await getGridData(meterdataSID4)

    mainItem['4'] = {}
    mainItem['4']['EQP_NO'] = meterdata4.Grid_Data[0].EQP_NO
    meterdata4.Grid_Data.forEach(e => {
        mainItem['4'][e.AUTODC_ITEM] = e.AUTODC_OUTPUT
    })

    $('#mainEQPNO4').text(mainItem['4'].EQP_NO)
    $('#Flowrate4').text(mainItem['4'].Flow_rate)
    $('#Velocity4').text(mainItem['4'].Fluid_velocity.toFixed(3))

    const totalFlowPositive4 = (parseFloat(mainItem['4'].Total_flow_positive) || 0) + (parseFloat(mainItem['4'].Total_flow_positive_decimal) || 0);
    $('#FlowPositive4').text(totalFlowPositive4.toFixed(3))


    // WASTE-WATER-GEMTEK
    let meterdata5 = await getGridData(meterdataSID5)

    mainItem['5'] = {}
    mainItem['5']['EQP_NO'] = meterdata5.Grid_Data[0].EQP_NO
    meterdata5.Grid_Data.forEach(e => {
        mainItem['5'][e.AUTODC_ITEM] = e.AUTODC_OUTPUT
    })

    $('#mainEQPNO5').text(mainItem['5'].EQP_NO)
    $('#Flowrate5').text(mainItem['5'].Flow_rate)
    $('#Velocity5').text(mainItem['5'].Velocity)

    const totalFlowPositive5 = (parseFloat(mainItem['5'].Total_flow) || 0) + (parseFloat(mainItem['5'].Total_flow_dec) || 0);
    $('#FlowPositive5').text(totalFlowPositive5.toFixed(3))
}

fetchData()