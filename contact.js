// input(入力欄)の直後にエラーメッセージ表示用の要素を確保する関数
function ensureErrorElement(input) {
    // inputの直後の要素を取得
    // ※ nextElementSibling は「次のHTML要素」を取ってくる
    let errorElem = input.nextElementSibling;
    // 要素が存在しない　または　要素は存在するが'error-msg'クラスを持っていない場合
    if (!errorElem || !errorElem.classList.contains('error-msg')) {
        // <div>タグを新しく作る
        errorElem = document.createElement('div');
        // クラス名に 'error-msg' をつける
        errorElem.className = 'error-msg';
        // inputの直後に新しい要素を挿入
        input.parentNode.insertBefore(errorElem, input.nextSibling);
    }
    return errorElem;
}

function validate() {
    // 名前
    // id='name' の要素を取得
    const name = document.getElementById('name');
    if (name) {
        // name(入力欄)にイベントリスナー(input=入力している最中)を追加
        name.addEventListener('input', () => {
            // 入力された値を取得
            const val = name.value;
            // エラーメッセージ表示用の要素を取得
            const errorName = ensureErrorElement(name);

            if (!val.trim()) {
                errorName.textContent = '名前が入力されていません';
            } else if (/^[\x20\u3000]/u.test(val)) {
                errorName.textContent = '先頭に不要なスペースがあります';
            } else if (/[^ぁ-んァ-ヶー一-龠々\s　]/u.test(val)) {
                errorName.textContent = 'ひらがな、カタカナ、漢字のみで入力してください';
            } else if (val.length > 20) {
                errorName.textContent = '名前は20文字以内で入力してください';
            } else {
                errorName.textContent = '';
            }
        });
    }

    // ふりがな
    const kana = document.getElementById('kana');
    if (kana) {
        kana.addEventListener('input', () => {
            const val = kana.value;
            const errorElem = ensureErrorElement(kana);

            if (!val.trim()) {
                errorElem.textContent = 'ふりがなが入力されていません';
            } else if (/^[\x20\u3000]/.test(val)) {
                errorElem.textContent = '先頭に不要なスペースがあります';
            } else if (/[^ぁ-んー\s　]/.test(val)) {
                errorElem.textContent = 'ひらがなで入力してください';
            } else if (val.length > 20) {
                errorElem.textContent = 'ふりがなは20文字以内で入力してください';
            } else {
                errorElem.textContent = '';
            }
        });
    }

    // ※ 生年月日の入力欄が存在する場合のみリアルタイムチェックを設定する（登録画面向け）
    const birthYear = document.getElementById('birth_year');
    const birthMonth = document.getElementById('birth_month');
    const birthDay = document.getElementById('birth_day');

    // 年月日それぞれの入力欄が存在する場合
    if (birthYear && birthMonth && birthDay) {
        // それぞれの入力欄にイベントリスナーを追加
        [birthYear, birthMonth, birthDay].forEach(elem => {
            elem.addEventListener('input', () => {
                // 入力値を取得
                const y = birthYear.value;
                const m = birthMonth.value;
                const d = birthDay.value;
                // エラーメッセージ表示用の要素を取得
                const errorElem = ensureErrorElement(birthYear);

                // 入力チェック
                if (!y || !m || !d) {
                    errorElem.textContent = '生年月日が入力されていません';
                    return;
                }

                // JSでは、登録データを文字列として受け取ってしまうため、parseIntで数値に変換する
                const yearNum = parseInt(y, 10);
                const monthNum = parseInt(m, 10);
                const dayNum = parseInt(d, 10);
                // 月は0から始まるため、-1をする
                const date = new Date(yearNum, monthNum - 1, dayNum);

                // 有効な日付になっていない場合
                if (
                    date.getFullYear() !== yearNum ||
                    date.getMonth() + 1 !== monthNum ||
                    date.getDate() !== dayNum
                ) {
                    errorElem.textContent = '生年月日が正しくありません';
                    return;
                }

                // 現在の日付を取得
                const today = new Date();
                if (date > today) {
                    errorElem.textContent = '生年月日が正しくありません';
                    return;
                }

                errorElem.textContent = '';
            });
        });
    }

    // 郵便番号
    const postalCode = document.getElementById('postal_code');
    if (postalCode) {
        postalCode.addEventListener('input', () => {
            const val = postalCode.value;
            const errorElem = ensureErrorElement(postalCode);

            if (!val.trim()) {
                errorElem.textContent = '郵便番号が入力されていません';
            } else if (!/-/.test(val)) {
                errorElem.textContent = '郵便番号にはハイフン（-）を入力してください';
            } else if (!/^\d{3}-\d{4}$/.test(val)) {
                errorElem.textContent = '郵便番号が正しくありません(半角数字で入力してください)';
            } else {
                errorElem.textContent = '';
            }
        });
    }

    // 住所
    const prefecture = document.getElementById('prefecture');
    const cityTown = document.getElementById('city_town');
    const building = document.getElementById('building');

    // 住所のリアルタイムチェック（都道府県・市区町村・建物名）
    if (prefecture && cityTown && building) {
        // 建物名の直下に表示するエラー要素を1つ用意（共通のエラーメッセージ表示先）
        const errorElem = ensureErrorElement(building);

        // それぞれの入力欄にinputイベントをセット
        [prefecture, cityTown, building].forEach(() => {
            // どれかが変更されたら住所全体をまとめてチェック
            [prefecture, cityTown, building].forEach(input => {
                input.addEventListener('input', () => {
                    let errorMsg = '';

                    // 都道府県チェック
                    if (!prefecture.value.trim()) {
                        errorMsg = '都道府県が入力されていません';
                    } else if (/^[\x20\u3000]/.test(prefecture.value)) {
                        errorMsg = '都道府県の先頭に不要なスペースがあります';
                    } else if (/[^一-龠々]/.test(prefecture.value)) {
                        errorMsg = '都道府県は漢字で入力してください';
                    } else if (prefecture.value.length > 10) {
                        errorMsg = '都道府県は10文字以内で入力してください';
                    }
                    // 市区町村チェック（都道府県OKなら）
                    else if (!cityTown.value.trim()) {
                        errorMsg = '市区町村・番地が入力されていません';
                    } else if (/^[\x20\u3000]/.test(cityTown.value)) {
                        errorMsg = '市区町村・番地の先頭に不要なスペースがあります';
                    } else if (/[^ぁ-んァ-ヶー一-龠々0-9\- 　]/.test(cityTown.value)) {
                        errorMsg = '市区町村・番地に不正な文字が含まれています（数字や記号は半角で入力してください）';
                    } else if (cityTown.value.length > 50) {
                        errorMsg = '市区町村・番地は50文字以内で入力してください';
                    }
                    // 建物名チェック（市区町村OKなら、かつ入力があれば）
                    else if (building.value) {
                        if (/^[\x20\u3000]/.test(building.value)) {
                            errorMsg = '建物名の先頭に不要なスペースがあります';
                        } else if (/[^ぁ-んァ-ヶー一-龠々0-9A-Za-z\- 　]/.test(building.value)) {
                            errorMsg = '建物名に不正な文字が含まれています（数字・アルファベット・記号は半角で入力してください）';
                        } else if (building.value.length > 50) {
                            errorMsg = '建物名は50文字以内で入力してください';
                        }
                    }

                    errorElem.textContent = errorMsg;
                });
            });
        });
    }

    // 電話番号
    const tel = document.getElementById('tel');
    if (tel) {
        tel.addEventListener('input', () => {
            const val = tel.value;
            const errorElem = ensureErrorElement(tel);

            if (!val.trim()) {
                errorElem.textContent = '電話番号が入力されていません';
            } else if (!val.includes('-')) {
                errorElem.textContent = '電話番号にはハイフン（-）を入力してください';
            } else if (
                !/^0\d{1,4}-\d{1,4}-\d{3,4}$/.test(val) ||
                val.length < 12 || val.length > 13
            ) {
                errorElem.textContent = '電話番号は12~13桁の半角数字で正しく入力してください';
            } else {
                errorElem.textContent = '';
            }
        });
    }

    // メールアドレス
    const email = document.getElementById('email');
    if (email) {
        email.addEventListener('input', () => {
            const val = email.value;
            const errorElem = ensureErrorElement(email);

            if (!val.trim()) {
                errorElem.textContent = 'メールアドレスが入力されていません';
            } else if (!/^[\w\.-]+@[\w\.-]+\.\w{2,}$/.test(val)) {
                errorElem.textContent = '有効なメールアドレスを入力してください（半角で入力してください）';
            } else {
                errorElem.textContent = '';
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    validate();
});
