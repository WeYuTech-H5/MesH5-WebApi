// 依賴套件: bootstrap5、jquery、jquery-ui

export class LayoutObject {
  constructor({
    sid = "",
    containerId,
    objectName,
    width,
    height,
    xAxis,
    yAxis,
    zIndex,
    opacity,
    relationTable,
    mappingItems = [],
    canEdit = false
  }) {
    this.sid = sid
    this.uniqueId = `LayoutObject_${parseInt(Math.random() * Date.now())}` //識別唯一物件
    this.containerId = containerId;
    this.objectName = objectName;
    this.width = width;
    this.height = height;
    this.xAxis = xAxis;
    this.yAxis = yAxis;
    this.zIndex = zIndex;
    this.opacity = opacity;
    this.relationTable = relationTable;
    this.mappingItems = mappingItems;
    this.canEdit = canEdit;
    this.enable = true;
    this.render();
  }

  render() {
    // 創建方塊元素
    $(`#${this.uniqueId}`).remove()
    const boxStyle = {
      position: "absolute",
      transition: "opacity 0.2s ease",
      opacity: `${this.opacity}`,
      zIndex: `${this.zIndex}`,
      minWidth: `${this.width}px`,
      minHeight: `${this.height}px`,
      left: `${this.xAxis}%`,
      top: `${this.yAxis}%`,
    }
    const $box = $(`
      <div class="layout-object card shadow-sm" id="${this.uniqueId}">
        <div class="card-header p-0 px-1 d-flex justify-content-between align-items-center">
          <span>${this.objectName}</span>
          <div class="d-flex gap-2 ${!this.canEdit ? 'd-none': ''}">
            <div class="text-secondary editObjectBtn" style="cursor: pointer"><i class="fa-solid fa-sm fa-pen"></i></div>
            <div class="text-secondary handle" style="cursor: move"><i class="fa-solid fa-grip-vertical"></i></div>
          </div>
        </div>
        <ul class="list-group list-group-flush">
          ${this.mappingItems.map(e => `<li class="list-group-item p-0 px-1">${e.label}: number</li>`).join('')}
        </ul>
      </div>
    `);
    $box.css(boxStyle);
    $box.hover(
      () => { $box.css("opacity", "1") },
      () => { $box.css("opacity", this.opacity) }
    );

    // 將方塊添加至畫面
    $(this.containerId).append($box);

    // 是否啟用拖動&縮放功能
    if(this.canEdit){
      $box.draggable({
        handle: ".handle", // 只允許拖動 handle
        containment: this.containerId, // 限制拖動範圍
        stop: (event, ui) => {
          // 計算 left 和 top 的百分比
          const containerWidth = $(this.containerId).width();
          const containerHeight = $(this.containerId).height();
          const leftPercent = ((ui.position.left / containerWidth) * 100).toFixed(2);
          const topPercent = ((ui.position.top / containerHeight) * 100).toFixed(2);
  
          // 更新實例屬性
          this.xAxis = leftPercent;
          this.yAxis = topPercent;

          $box.css({
            left: `${this.xAxis}%`,
            top: `${this.yAxis}%`
          });
  
          console.log(`Updated xAxis: ${this.xAxis}%`);
          console.log(`Updated yAxis: ${this.yAxis}%`);
        }
      });

      $box.resizable({
        autoHide: true,
        containment: this.containerId,
        stop: (event, ui) => {
          ui.size.height = ui.size.height / 1;
          ui.size.height = ui.size.height / 1;
          this.width = ui.size.width;
          this.height = ui.size.height;

          console.log(`Updated height: ${this.height}px`);
          console.log(`Updated width: ${this.width}px`);
        }
      });
      $box.find(".editObjectBtn").click(()=>this.openEditModal())
    }


  }

  toData() {
    return {
      DETAIL_LAYOUT_SID: this.sid,
      OBJECT_NAME: this.objectName,
      HIGH: this.height,
      WIDTH: this.width,
      X: this.xAxis,
      Y: this.yAxis,
      ZINDEX: this.zIndex,
      OPACITY: this.opacity,
      TABLE_NAME: this.relationTable,
      enable: this.enable,
      ITEM_LIST: this.mappingItems.map((item)=>{
        return {
          SID:item.sid,
          ITEM:item.label,
          VALUE:item.field,
          QUERY:item.condition,
        }
      }),
    };
  }

  openEditModal() {
    $("#editObjectModal").remove()
    const $Modal = $(`
      <div class="modal fade" id="editObjectModal" tabindex="-1" aria-labelledby="editObjectModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="editObjectModalLabel">編輯</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <form id="objectForm">
                <div class="mb-2">
                  <label for="objectName" class="form-label fw-bold">Object 名稱</label>
                  <input type="text" value="${this.objectName}" id="objectName" class="form-control" placeholder="輸入 Object 名稱">
                </div>
      
                <div class="row mb-2">
                  <div class="col-md-6">
                    <label for="objectHeight" class="form-label fw-bold">最小高度</label>
                    <input type="number" id="objectHeight" class="form-control form-control-sm"  value="${this.height}" placeholder="輸入長度">
                  </div>
                  <div class="col-md-6">
                    <label for="objectWidth" class="form-label fw-bold">最小寬度</label>
                    <input type="number" id="objectWidth" class="form-control form-control-sm"  value="${this.width}" placeholder="輸入寬度">
                  </div>
                </div>
      
                <div class="row mb-2">
                  <div class="col-md-6">
                    <label for="objectXAxis" class="form-label fw-bold">x 軸 (%)</label>
                    <input type="number" id="objectXAxis" class="form-control form-control-sm" value="${this.xAxis}" step="0.01" placeholder="輸入 x 軸座標">
                  </div>
                  <div class="col-md-6">
                    <label for="objectYAxis" class="form-label fw-bold">y 軸 (%)</label>
                    <input type="number" id="objectYAxis" class="form-control form-control-sm" value="${this.yAxis}" step="0.01" placeholder="輸入 y 軸座標">
                  </div>
                </div>
                <div class="row mb-2">
                  <div class="col-md-6">
                    <label for="objectXAxis" class="form-label fw-bold">z-index</label>
                    <input type="number" id="objectZIndex" class="form-control form-control-sm" value="${this.zIndex}" min="0" step="1" placeholder="輸入 z-index">
                  </div>
                  <div class="col-md-6">
                    <label for="objectYAxis" class="form-label fw-bold">透明度</label>
                    <input type="number" id="objectOpacity" class="form-control form-control-sm" value="${this.opacity}" max="1" min="0" step="0.01" placeholder="輸入 0-1 的透明度">
                  </div>
                </div>
      
                <div class="mb-2">
                  <label for="relationTable" class="form-label fw-bold">所屬 Table</label>
                  <select id="relationTable" class="form-select form-select-sm">
                    <option value="" ${this.relationTable ? 'selected' : ''} disabled>選擇 Table</option>
                    <option value="EQP_AUTODC_OUTPUT" ${this.relationTable === 'EQP_AUTODC_OUTPUT' ? 'selected' : ''}>EQP_AUTODC_OUTPUT</option>
                    <option value="EQP_STATUS_CHANGE_HIST" ${this.relationTable === 'EQP_STATUS_CHANGE_HIST' ? 'selected' : ''}>EQP_STATUS_CHANGE_HIST</option>
                  </select>
                </div>
      
                <div class="mb-2">
                  <label class="form-label fw-bold">Detail value</label>
                  <table class="table table-bordered" id="mappingTable">
                    <thead>
                      <tr>
                        <th>項目名稱</th>
                        <th>對應欄位</th>
                        <th>查詢條件</th>
                        <th width="80px">操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${this.mappingItems.map(item => `
                        <tr data-sid="${item.sid}">
                          <td><input type="text" value="${item.label}" class="form-control form-control-sm" placeholder="輸入項目名稱"></td>
                          <td><input type="text" value="${item.field}" class="form-control form-control-sm" placeholder="輸入對應欄位"></td>
                          <td><input type="text" value="${item.condition}" class="form-control form-control-sm" placeholder="輸入查詢條件"></td>
                          <td>
                            <button type="button" class="btn btn-sm btn-outline-danger deleteRowButton">刪除</button>
                          </td>
                        </tr>`
                      ).join("")}
                    </tbody>
                  </table>
                  <button type="button" id="addRowButton" class="btn btn-sm btn-outline-primary">+ 新增行</button>
                </div>
              </form>
            </div>
            <div class="modal-footer">
              <button type="button" id="removeObjectButton" class="btn btn-danger">刪除object</button>
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">返回</button>
              <button type="button" id="saveObjectButton" class="btn btn-primary">保存</button>
            </div>
          </div>
        </div>
      </div>
    `);
    $('body').append($Modal)
    $Modal.modal('show')

    const tableBody = $("#mappingTable tbody");
  
    // 動態新增行
    $("#addRowButton").click(function () {
      const newRow = `
        <tr data-sid="">
          <td><input type="text" class="form-control form-control-sm" placeholder="輸入項目名稱"></td>
          <td><input type="text" class="form-control form-control-sm" placeholder="輸入對應欄位"></td>
          <td><input type="text" class="form-control form-control-sm" placeholder="輸入查詢條件"></td>
          <td>
            <button type="button" class="btn btn-outline-danger deleteRowButton">刪除</button>
          </td>
        </tr>`;
      tableBody.append(newRow);
    });
  
    // 刪除行
    tableBody.on("click", ".deleteRowButton", function () {
      $(this).closest("tr").remove();
    });
  
    // 保存按鈕
    const self = this
    $("#saveObjectButton").click(function () {
      const objectData = {
        containerId: "#imagePreview",
        objectName: $("#objectName").val(),
        width: $("#objectWidth").val(),
        height: $("#objectHeight").val(),
        xAxis: $("#objectXAxis").val(),
        yAxis: $("#objectYAxis").val(),
        zIndex: $("#objectZIndex").val(),
        opacity: $("#objectOpacity").val(),
        relationTable: $("#relationTable").val(),
        mappingItems: [],
      };
  
      $("#mappingTable tbody tr").each(function () {
        const sid = $(this).data("sid")
        const label = $(this).find("td:eq(0) input").val();
        const field = $(this).find("td:eq(1) input").val();
        const condition = $(this).find("td:eq(2) input").val();
        // if (label && field) {
          objectData.mappingItems.push({sid, label, field, condition });
        // }
      });
  
      // 在此處可進一步處理資料，例如發送至後端
      Object.assign(self, objectData);
      self.render()
      $Modal.modal('hide')
    });

    // 移除按鈕
    $("#removeObjectButton").click(function() {
      const yes = confirm("確定刪除object?")
      if(yes){
        self.enable = false
        $(`#${self.uniqueId}`).remove()
        $Modal.modal('hide')
      }
    })
  }
}
