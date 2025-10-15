//menu 選單連結
document.addEventListener("DOMContentLoaded", function () {
    const menuItems = [
        { text: "圖表一覽", href: "../chart-demo/chart-demo.html" },
        { text: "三欄式排版", href: "../template01/template01.html" },
        { text: "兩欄式排版", href: "../template02/template02.html" },
        { text: "三兩欄式排版", href: "../template03/template03.html" },
        { text: "兩欄式排版-2", href: "../template04/template04.html" },
        { text: "一二四欄式排版", href: "../template05/template05.html" },
        { text: "一三一欄式排版", href: "../template06/template06.html" },
        { text: "四二欄式排版", href: "../template07/template07.html" },
        { text: "兩欄式排版", href: "../template08/template08.html" },
        // 如果有更多項目，可以在這裡添加
    ];

    const dynamicMenu = document.getElementById("Menu");

    menuItems.forEach(item => {
        const li = document.createElement("li");
        const a = document.createElement("a");
        a.className = "dropdown-item";
        a.href = item.href;
        a.textContent = item.text;
        li.appendChild(a);
        dynamicMenu.appendChild(li);
    });
});

// heard 當前時間
function updateTime() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    document.getElementById('current-time').textContent = `${hours}:${minutes}`;
}

updateTime();
setInterval(updateTime, 60000);