<?php

class Validator
{
    private $error_message = [];

    // 呼び出し元で使う
    public function validate($data)
    {
        $this->error_message = [];

        // 名前
        // $dataに値が入力されていない　または　スペースのみで構成されている場合
        if (empty($data['name']) || preg_match('/^[\s　]+$/u', $data['name'])) {
            $this->error_message['name'] = '名前が入力されていません';

            // 先頭に半角または全角スペースがある場合
        } elseif (preg_match('/^[\x20\x{3000}]/u', $data['name'])) {
            $this->error_message['name'] = '先頭に不要なスペースがあります';

            // ひらがな、カタカナ、漢字、スペース以外の文字が含まれている場合
        } elseif (preg_match('/[^ぁ-んァ-ヶー一-龠々\s　]/u', $data['name'])) {
            $this->error_message['name'] = 'ひらがな、カタカナ、漢字のみで入力してください';

            // 名前の長さが20文字を超える場合
        } elseif (mb_strlen($data['name']) > 20) {
            $this->error_message['name'] = '名前は20文字以内で入力してください';
        }


        // ふりがな
        // $dataに値が入力されていない　または　スペースのみで構成されている場合
        if (empty($data['kana']) || preg_match('/^[\s　]+$/u', $data['kana'])) {
            $this->error_message['kana'] = 'ふりがなが入力されていません';

            // 先頭に半角または全角スペースがある場合
        } elseif (preg_match('/^[\x20\x{3000}]/u', $data['kana'])) {
            $this->error_message['kana'] = '先頭に不要なスペースがあります';

            // ひらがな、長音記号、スペース以外の文字が含まれている場合
        } elseif (preg_match('/[^ぁ-んー\s　]/u', $data['kana'])) {
            $this->error_message['kana'] = 'ひらがなで入力してください';

            // ふりがなの長さが20文字を超える場合
        } elseif (mb_strlen($data['kana']) > 20) {
            $this->error_message['kana'] = 'ふりがなは20文字以内で入力してください';
        }


        // 生年月日
        if (empty($data['birth_year']) || empty($data['birth_month']) || empty($data['birth_day'])) {
            $this->error_message['birth_date'] = '生年月日が入力されていません';
        } elseif (!$this->isValidDate($data['birth_year'] ?? '', $data['birth_month'] ?? '', $data['birth_day'] ?? '')) {
            $this->error_message['birth_date'] = '生年月日が正しくありません';
            // 未来日のチェック
        } else {
            $input_date = sprintf('%04d-%02d-%02d', (int)$data['birth_year'], (int)$data['birth_month'], (int)$data['birth_day']);
            $today = date('Y-m-d');
            if ($input_date > $today) {
                $this->error_message['birth_date'] = '生年月日が正しくありません';
            }
        }


        // 郵便番号
        if (empty($data['postal_code'])) {
            $this->error_message['postal_code'] = '郵便番号が入力されていません';
            // ハイフンの有無
        } elseif (!preg_match('/-/', $data['postal_code'] ?? '')) {
            $this->error_message['postal_code'] = '郵便番号にはハイフン（-）を入力してください';
        } elseif (!preg_match('/^[0-9]{3}-[0-9]{4}$/', $data['postal_code'] ?? '')) {
            $this->error_message['postal_code'] = '郵便番号が正しくありません(半角数字で入力してください)';
        }


        // 住所
        // 都道府県または市区町村が未入力　または　スペースのみで構成されている場合
        if (
            empty($data['prefecture']) || preg_match('/^[\s　]+$/u', $data['prefecture'] ?? '') ||
            empty($data['city_town']) || preg_match('/^[\s　]+$/u', $data['city_town'] ?? '')
        ) {
            $this->error_message['address'] = '住所(都道府県もしくは市区町村・番地)が入力されていません';

            // 都道府県：先頭に半角または全角スペースがある場合
        } elseif (preg_match('/^[\x20\x{3000}]/u', $data['prefecture'])) {
            $this->error_message['address'] = '先頭に不要なスペースがあります';

            // 都道府県：漢字のみ許可
        } elseif (preg_match('/[^一-龠々]/u', $data['prefecture'])) {
            $this->error_message['address'] = '都道府県は漢字で入力してください';

            // 市区町村：先頭に半角または全角スペースがある場合
        } elseif (preg_match('/^[\x20\x{3000}]/u', $data['city_town'])) {
            $this->error_message['address'] = '先頭に不要なスペースがあります';

            // 市区町村：ひらがな・カタカナ・漢字・半角数字・スペース・ハイフン許可、その他記号不可
        } elseif (preg_match('/[^ぁ-んァ-ヶー一-龠々0-9\- 　]/u', $data['city_town'])) {
            $this->error_message['address'] = '不正な文字が含まれています(数字や記号は半角で入力してください)';

            // 建物名：値が入力されている　かつ　先頭に半角または全角スペースがある場合
        } elseif (!empty($data['building']) && preg_match('/^[\x20\x{3000}]/u', $data['building'])) {
            $this->error_message['address'] = '先頭に不要なスペースがあります';

            // 建物名：値が入力されている　かつ　ひらがな・カタカナ・漢字・半角英数字・スペース・ハイフン許可、その他記号不可
        } elseif (!empty($data['building']) && preg_match('/[^ぁ-んァ-ヶー一-龠々0-9A-Za-z\- 　]/u', $data['building'])) {
            $this->error_message['address'] = '不正な文字が含まれています(数字・アルファベット・記号は半角で入力してください)';

            // 桁数のチェック
        } elseif (mb_strlen($data['prefecture']) > 10) {
            $this->error_message['address'] = '都道府県は10文字以内で入力してください';
        } elseif (mb_strlen($data['city_town']) > 50 || mb_strlen($data['building']) > 50) {
            $this->error_message['address'] = '市区町村・番地もしくは建物名は50文字以内で入力してください';
        }


        // 電話番号
        if (empty($data['tel'])) {
            $this->error_message['tel'] = '電話番号が入力されていません';
            // ハイフンの有無
        } elseif (!preg_match('/-/', $data['tel'] ?? '')) {
            $this->error_message['tel'] = '電話番号にはハイフン（-）を入力してください';
        } elseif (
            !preg_match('/^0\d{1,4}-\d{1,4}-\d{3,4}$/', $data['tel'] ?? '') ||
            mb_strlen($data['tel']) < 12 ||
            mb_strlen($data['tel']) > 13
        ) {
            $this->error_message['tel'] = '電話番号は12~13桁の半角数字で正しく入力してください';
        }


        // メールアドレス
        if (empty($data['email'])) {
            $this->error_message['email'] = 'メールアドレスが入力されていません';
        } elseif (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            $this->error_message['email'] = '有効なメールアドレスを入力してください(半角で入力してください)';
        }

        return empty($this->error_message);
    }


    // エラーメッセージ取得
    public function getErrors()
    {
        return $this->error_message;
    }

    // 生年月日の日付整合性チェック
    private function isValidDate($year, $month, $day)
    {
        return checkdate((int)$month, (int)$day, (int)$year);
    }
}
