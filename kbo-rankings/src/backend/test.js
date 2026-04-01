  const g_id = "20250928LTOB0";
  const sr_id = "0";
  let naverGameId = "";
    if (sr_id === "0" || sr_id === "1") {
      naverGameId = g_id + (g_id.length >= 4 ? g_id.substring(0, 4) : "");
    }
  console.log(naverGameId);
