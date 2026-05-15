// ══════════════════════════════════════════════════════════
//  학생 작품 투표 — Google Apps Script
//  이 파일 전체를 복사해서 Apps Script 편집기에 붙여넣으세요
// ══════════════════════════════════════════════════════════

var SHEET_NAME = '투표결과';

// POST: 투표 데이터 받아서 시트에 기록
function doPost(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_NAME);

    // 시트가 없으면 새로 만들고 헤더 추가
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      sheet.appendRow(['타임스탬프', '선택1', '선택2', '선택3', '선택 수']);
    }

    var data = JSON.parse(e.postData.contents);
    var votes = data.votes || [];
    var row = [
      new Date(),
      votes[0] ? '작품 ' + votes[0] + '번' : '',
      votes[1] ? '작품 ' + votes[1] + '번' : '',
      votes[2] ? '작품 ' + votes[2] + '번' : '',
      votes.length
    ];
    sheet.appendRow(row);

  } catch (err) {
    // 오류 기록용
    Logger.log(err.toString());
  }

  return ContentService
    .createTextOutput('ok')
    .setMimeType(ContentService.MimeType.TEXT);
}

// GET: 작품별 득표수 반환 (결과 확인용)
function doGet(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) {
      return ContentService
        .createTextOutput(JSON.stringify({ error: '데이터 없음' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    var data = sheet.getDataRange().getValues();
    var counts = {};

    // 헤더(1행) 제외하고 집계
    for (var i = 1; i < data.length; i++) {
      for (var col = 1; col <= 3; col++) {
        var val = data[i][col];
        if (val) {
          counts[val] = (counts[val] || 0) + 1;
        }
      }
    }

    // 득표수 내림차순 정렬
    var sorted = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }));

    return ContentService
      .createTextOutput(JSON.stringify({ total: data.length - 1, results: sorted }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
