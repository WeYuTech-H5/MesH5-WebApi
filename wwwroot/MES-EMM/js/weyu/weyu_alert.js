
// SweetAlert2
// 1.載入js、css
function loadSweetAlert2(){
    let script = document.createElement('script');
    script.src = "../js/comm/sweetalert2.min.js";
    script.type = 'text/javascript';
    document.head.appendChild(script);

    let link = document.createElement('link');
    link.href = "../css/comm/sweetalert2.min.css";
    link.rel = 'stylesheet';
    link.type = 'text/css';
    document.head.appendChild(link);
}
loadSweetAlert2()

// 2.confirm確認窗
// 用法 替換原 confirm() => await customConfirm() 
function customConfirm(confirmMsg){
    return new Promise((resolve) => {
        Swal.fire({
            title: confirmMsg,
            showCancelButton: true,
            confirmButtonText: "確認",
            cancelButtonText: 返回
        }).then((result) => {
            if (result.isConfirmed) {
                resolve(true)
            }else{
                resolve(false)
            }
        });
    });
}

// 2.confirm確認窗
// 用法 替換原 confirm() => await customConfirm()
function customConfirm(confirmMsg){
    let len = confirmMsg.length
    let width;
    if (len > 32) {
        width = "48em";
    } else {
        width = "32em";
    }

    return new Promise((resolve) => {
        Swal.fire({
            title: confirmMsg,
            showCancelButton: true,
            confirmButtonText: "確認",
            cancelButtonText: `返回`,
            confirmButtonColor: "#004aa5",
            width: width
        }).then((result) => {
            if (result.isConfirmed) {
                resolve(true)
            }else{
                resolve(false)
            }
        });
    });
}

// 2.alert提示窗
// 用法 替換原 alert() => await customAlertSuccess()
// 若不需要等待用戶按下OK 則不用加"await"
function customAlertSuccess(alertMsg){
    return new Promise((resolve) => {
        Swal.fire({
            text: alertMsg,
            icon: "success",
            confirmButtonColor: "#004aa5"
        }).then(() => {
            resolve(true)
        });
    })
}
function customAlertError(alertMsg){
    return new Promise((resolve) => {
        Swal.fire({
            text: alertMsg,
            icon: "error",
            confirmButtonColor: "#004aa5"
        }).then(() => {
            resolve(true)
        });
    })

}
function customAlertWarning(alertMsg){
    return new Promise((resolve) => {
        Swal.fire({
            text: alertMsg,
            icon: "warning",
            confirmButtonColor: "#004aa5"
        }).then(() => {
            resolve(true)
        });
    })
}
