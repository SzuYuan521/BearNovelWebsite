import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import "../css/agreement.css"; // 這裡引入自定義CSS文件

const Agreement = () => {
  return (
    <Container className="agreement-container">
      <Row>
        <Col>
          <h1>小熊小說網會員服務協議</h1>
          <h2>一、服務內容</h2>
          <ol>
            <li>
              <strong>服務範圍</strong>{" "}
              本網站提供小說閱讀、創作、評論、點讚等功能。具體服務內容以本網站實際提供的功能為準。
            </li>
            <li>
              <strong>會員帳號</strong>{" "}
              會員可以通過註冊帳號來使用本網站的部分功能。會員應確保所提供的資料真實、準確、完整，並且更新個人資料以保持其正確性。
            </li>
          </ol>
          <h2>二、會員義務</h2>
          <ol>
            <li>
              <strong>合法使用</strong>{" "}
              會員應合法使用本網站，不得利用本網站從事任何非法或侵害他人權益的活動。
            </li>
            <li>
              <strong>內容責任</strong>{" "}
              會員發佈的內容（如小說、評論等）應遵守法律法規，不得涉及色情、暴力、非法活動等內容。會員應對其發佈的內容負責，並承擔因此產生的法律責任。
            </li>
            <li>
              <strong>帳號安全</strong>{" "}
              會員應妥善保管帳號密碼，對其帳號下的所有活動負責。若發現帳號被盜用或存在安全問題，應及時通知本網站。
            </li>
          </ol>
          <h2>三、知識產權</h2>
          <ol>
            <li>
              <strong>著作權</strong>{" "}
              會員在本網站發佈的內容，其著作權歸會員所有。但會員同意本網站有權在本網站及其合作媒體上展示、傳播這些內容。
            </li>
            <li>
              <strong>網站內容</strong>{" "}
              本網站所提供的所有內容，包括但不限於文字、圖片、音頻、視頻等，其知識產權歸本網站所有或已獲得合法授權。未經許可，任何人不得擅自使用、複製、傳播或修改這些內容。
            </li>
          </ol>
          <h2>四、服務變更與終止</h2>
          <ol>
            <li>
              <strong>服務變更</strong>{" "}
              本網站有權隨時對服務內容進行變更、暫停或終止，無需提前通知會員。
            </li>
            <li>
              <strong>協議終止</strong>{" "}
              若會員違反本協議或其他法律法規，本網站有權隨時終止或暫停會員的帳號，並追究相關法律責任。
            </li>
          </ol>
          <h2>五、免責聲明</h2>
          <ol>
            <li>
              <strong>服務中斷</strong>{" "}
              本網站不對因不可抗力因素或第三方因素造成的服務中斷、數據丟失等問題承擔責任。
            </li>
            <li>
              <strong>第三方網站</strong>{" "}
              本網站可能包含指向第三方網站的鏈接，這些網站不受本網站控制，本網站對其內容或服務不承擔任何責任。
            </li>
          </ol>
          <h2>六、隱私政策</h2>
          <ol>
            <li>
              <strong>個人信息</strong>{" "}
              本網站將依法收集、使用和保護會員的個人信息。具體的隱私政策請參見本網站的隱私政策頁面。
            </li>
          </ol>
          <h2>七、法律適用與爭議解決</h2>
          <ol>
            <li>
              <strong>法律適用</strong>{" "}
              本協議的訂立、效力、解釋及爭議解決均適用[所在國/地區]的法律。
            </li>
            <li>
              <strong>爭議解決</strong>{" "}
              因本協議引起的或與本協議有關的爭議，應通過友好協商解決；協商不成時，任何一方均可向[所在國/地區]有管轄權的法院提起訴訟。
            </li>
          </ol>
          <h2>八、協議修改</h2>
          <p>
            本網站有權隨時修改本協議的條款，並將修改後的條款公告於網站上。修改後的條款一經公告，即時生效。會員繼續使用本網站即表示接受修改後的協議。
          </p>
        </Col>
      </Row>
    </Container>
  );
};

export default Agreement;
