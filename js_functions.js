// js_functions.js
// 務必在 index.html 那邊，先引用 esprima.js，才引用這個檔案。

function testing(src) {
  try {
    var syntax = esprima.parseScript(src);
    return "語法有效！";
  } catch (e) {
    return e.toString();
  }
}

function jsDemoPrompt() {
  let x = prompt("請輸入文字，然後按下確定鍵");
  return (x == null ? "" : x);
}


/// 檢查程式碼
///
/// 輸入：函式內的程式碼、參考答案
/// 輸出：是否通過檢查的字串
function jsCheckCode(src, jsonAnswer) {
	const syntax_ok_message = "語法檢查正確！";
	const syntax_error_message = "未通過，語法錯誤。請修正程式碼再送出。";

	const answer_error_message = "未通過，輸出結果與答案不符。請修正程式碼再送出。";
	const answer_ok_message = "你的程式通過所有測試，恭喜。";

	const running_error_message = "未通過，有未定義的變數或函數。請修正程式碼再送出。";
	const reference_error_message = "未通過，使用了未定義的變數或函式。請修正程式碼再送出。";
	const undefined_error_message = "未通過，回傳值未定義。請修正程式碼再送出。";

	// 語法檢查
	function checkSyntax (src) {
		try {
			let syntax = esprima.parseScript(src); // parse 語法
			return [true, syntax_ok_message];
		} catch (e) {
			if (e.toString().includes("Line")) {
				let tmp = e.toString().substring(e.toString().indexOf("Line")+5);
				let n = Number(tmp.substring(0, tmp.indexOf(":")));
				let msg = `未通過，第 ${n} 行有語法錯誤。請修正程式碼再送出。`;
				return [false, msg];
			}
			return [false, syntax_error_message];
		}
	}

	// 執行結果檢查
	function checkAnswer(src, jsonAnswer) {
		// 解析輸入資料
		let ansObjects = JSON.parse(jsonAnswer);
		let func = new Function("x", src);
		try {
			for (let i=0; i< ansObjects.length; i++) {
				let ansObject = ansObjects[i];
				let res = func(ansObject.dataIn);
				if (!res) {
					return [false, undefined_error_message];
				}
				// 檢查是否答案錯誤 (將答案一律轉成 string 來比較，則無論是數值、字串、或陣列皆可比較)
				if ( ansObject.dataOut.toString() != func(ansObject.dataIn).toString() ) {
					return [false, answer_error_message];
				}
			}
		} catch (e) {
			if (e.toString().includes("not defined")) {
				return [false, reference_error_message];
			}
			return [false, running_error_message];
		}

		return [true, answer_ok_message];
	}

	// 1. 檢查語法是否有效
	[is_syntax_ok, result] = checkSyntax(`(x) => { ${src}\n }`);
	if (!is_syntax_ok) { // 語法無效，回傳錯誤訊息
		return result;
	}

	// 2. 檢查執行答案是否正確
	[is_answer_ok, result] = checkAnswer(src, jsonAnswer);
	return result;
}

/// 測試程式碼執行結果
///
/// 輸入：函式內的程式碼、測試輸入值
/// 輸出：程式錯誤訊息，或函式執行的回傳值
function jsTestCode(src, valueString) {
	const syntax_ok_message = "語法檢查正確！";
	const syntax_error_message = "未通過，語法錯誤。請修正程式碼再送出。";

	const type_error_message = "輸入值非數字、字串或陣列。";
	const running_error_message = "有未定義的變數或函數。";
	const reference_error_message = "使用了未定義的變數或函式。";
	const undefined_error_message = "回傳值未定義。";

	// 語法檢查
	function checkSyntax (src) {
		try {
			let syntax = esprima.parseScript(src); // parse 語法
			return [true, syntax_ok_message];
		} catch (e) {
			if (e.toString().includes("Line")) {
				let tmp = e.toString().substring(e.toString().indexOf("Line")+5);
				let n = Number(tmp.substring(0, tmp.indexOf(":")));
				let msg = `未通過，第 ${n} 行有語法錯誤。請修正程式碼再送出。`;
				return [false, msg];
			}
			return [false, syntax_error_message];
		}
	}

	function testRun (src, vString) {
		// 嘗試將 vString 解析為數值、字串或陣列，若都失敗，則回報錯誤訊息
        let v = (new Function("return " + vString + ";"))();
        if (!(typeof(v) === "number" || typeof(v) === "string" || Object.prototype.toString.call(v) === "[object Array]")) {
        	return [false, type_error_message];
        }

		let func = new Function("x", src);
		try {
			let res = func(v);
			if (!res) {
				return [false, undefined_error_message];
			}
			return [true, String(res)];
		} catch (e) {
			if (e.toString().includes("not defined")) {
				return [false, reference_error_message];
			}
			return [false, running_error_message];
		}
	}

	// 1. 檢查語法是否有效
	[is_syntax_ok, result] = checkSyntax(`(x) => { ${src}\n }`);
	if (!is_syntax_ok) { // 語法無效，回傳錯誤訊息
		return result;
	}

	// 2. 執行函式，回傳執行結果
	[is_run_ok, result] = testRun(src, valueString);
	return result;
}