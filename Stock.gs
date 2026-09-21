function getLatestMedicationStock() {

  const medicationID =
      getConfigValue("MedicationModuleID");

  const ss =
      SpreadsheetApp.openById(medicationID);

  const sheet =
      ss.getSheetByName(
          CONFIG.MEDICATION_STOCK_SHEET
      );

  const data =
      sheet.getDataRange().getValues();

  const header =
      data.shift();

  const stockIDCol =
      header.indexOf("StockID");

  const rxCol =
      header.indexOf("RxOrderID");

  const dateCol =
      header.indexOf("StockDate");

  let latest = {};

  data.forEach(function(row){

      const rx =
          row[rxCol];

      const stockDate =
          new Date(row[dateCol]);

      if(
          !latest[rx] ||
          stockDate >
          latest[rx]._date
      ){

          let obj = {};

          header.forEach(function(name,index){

              obj[name] =
                  row[index];

          });

          obj._date =
              stockDate;

          latest[rx] =
              obj;

      }

  });

  return Object.values(latest);

}

function getTrackingMethod(unit){

    const medicationID =
        getConfigValue("MedicationModuleID");

    const ss =
        SpreadsheetApp.openById(
            medicationID
        );

    const sheet =
        ss.getSheetByName(
            CONFIG.STOCK_UNIT_SHEET
        );

    const data =
        sheet.getDataRange().getValues();

    const header =
        data.shift();

    const unitCol =
        header.indexOf("Unit");

    const methodCol =
        header.indexOf("Tracking Method");

    for(const row of data){

        if(row[unitCol] == unit){

            return row[methodCol];

        }

    }

    return "";

}

function testLatestMedicationStock() {

  const latest = getLatestMedicationStock();

  Logger.log("Total latest records: " + latest.length);

  latest.forEach(function(stock) {

    Logger.log(
      stock.RxOrderID +
      " | " +
      stock.ResidentID +
      " | " +
      stock.Balance +
      " " +
      stock.Unit +
      " | " +
      stock.StockDate
    );

  });

}

function buildStockStatus(stock){

    const trackingMethod =
        getTrackingMethod(stock.Unit);

    if(trackingMethod == "Estimate"){

        return "📦 " +
            stock.Balance +
            " " +
            stock.Unit +
            "(s) In Stock";

    }

    const days =
        Number(stock["Days Remaining"]);

    if(days < 7){

        return "🔴 " +
            Math.round(days) +
            " Days Left";

    }

    if(days < 14){

        return "🟠 " +
            Math.round(days) +
            " Days Left";

    }

    return "🟢 " +
        Math.round(days) +
        " Days Left";

}

function testBuildStockStatus(){

    const purchaseList =
        getPurchaseList();

    purchaseList.forEach(function(item){

        Logger.log(

            item.resident.Residents +

            " | " +

            buildStockStatus(
                item.stock
            )

        );

    });

}