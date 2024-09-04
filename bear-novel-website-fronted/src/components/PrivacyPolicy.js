import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import "../css/Agreement.css"; // 這裡引入自定義CSS文件

const PrivacyPolicy = () => {
  return (
    <Container className="agreement-container">
      <Row>
        <Col>
          <h1>小熊小說網隱私權條款</h1>
          <h2>一、資訊收集</h2>
          <ol>
            <li>
              <strong>收集的資訊類型</strong>
              我們會收集您在註冊、使用本網站服務時提供的個人資訊，包括但不限於姓名、電子郵件地址、帳號資訊等。我們也可能會收集您在使用本網站時自動產生的資料，例如IP地址、瀏覽器類型、訪問時間等。
            </li>
            <li>
              <strong>資訊收集方式</strong>
              <ul>
                <li>
                  <strong>直接收集</strong>
                  ：當您註冊帳號、更新個人資訊或提交其他要求時，我們會直接收集您提供的資料。
                </li>
                <li>
                  <strong>自動收集</strong>
                  ：當您使用本網站服務時，我們會通過Cookies、日誌文件等技術自動收集您的使用資訊。
                </li>
              </ul>
            </li>
          </ol>
          <h2>二、資訊使用</h2>
          <ol>
            <li>
              <strong>提供服務</strong>
              我們會使用您的資訊來提供和改進本網站的服務，包括帳號管理、內容推送、客戶支持等。
            </li>
            <li>
              <strong>個性化體驗</strong>
              我們可能會根據您的使用行為和興趣，提供個性化的內容和推薦服務。
            </li>
            <li>
              <strong>通知與溝通</strong>
              我們會使用您的聯絡資訊發送有關帳號和服務的通知，例如重要更新、安全提醒等。
            </li>
            <li>
              <strong>營銷與推廣</strong>
              在獲得您的同意後，我們可能會使用您的資訊進行營銷和推廣活動，包括發送促銷信息和廣告。
            </li>
          </ol>
          <h2>三、資訊保護</h2>
          <ol>
            <li>
              <strong>安全措施</strong>
              我們會採取合理的技術和管理措施來保護您的個人資訊，防止未經授權的訪問、使用、修改或刪除。
            </li>
            <li>
              <strong>資訊儲存</strong>
              我們會將您的個人資訊儲存於安全的伺服器中，並僅在達到收集目的所需的期間內保留您的資訊。
            </li>
          </ol>
          <h2>四、資訊分享</h2>
          <ol>
            <li>
              <strong>第三方服務</strong>
              我們可能會與第三方合作夥伴分享您的資訊，以提供相關服務，例如支付處理、數據分析等。這些第三方服務提供商受我們的合約約束，必須保護您的資訊安全。
            </li>
            <li>
              <strong>法律要求</strong>
              我們可能會在法律要求、法規遵守或法律程序需要時，披露您的資訊。
            </li>
          </ol>
          <h2>五、您的權利</h2>
          <ol>
            <li>
              <strong>查閱與更正</strong>
              您有權查閱、修改或更新我們持有的關於您的個人資訊。
            </li>
            <li>
              <strong>刪除資訊</strong>
              在某些情況下，您可以要求我們刪除您的個人資訊。
            </li>
            <li>
              <strong>拒絕營銷</strong> 您可以隨時拒絕接收我們發送的營銷信息。
            </li>
          </ol>
          <h2>六、條款修改</h2>
          <p>
            本網站有權隨時修改本條款，並將修改後的條款公告於網站上。修改後的條款一經公告，即時生效。您繼續使用本網站即表示接受修改後的條款。
          </p>
          <h2>七、聯絡我們</h2>
          <p>
            如果您對本條款有任何疑問或關切，請聯絡我：
            <br />
            電子郵件：
            <a href="mailto:SzuYuan521@gmail.com">SzuYuan521@gmail.com</a>
          </p>
        </Col>
      </Row>
    </Container>
  );
};

export default PrivacyPolicy;
