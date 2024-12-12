import React from "react";
import { NavLink } from "react-router-dom";

const SectionInformation: React.FC = () => {
  return (
    <section className="ftco-section ftc-no-pb ftc-no-pt">
      <div className="container">
        <div className="row">
          <div
            className="col-md-5 p-md-5 img-4 img-2 d-flex justify-content-center align-items-center"
            style={{ backgroundImage: "url(user/images/3.jpg)" }}
            >
            <NavLink
              to="https://vimeo.com/1018941577"
              className="icon popup-vimeo d-flex justify-content-center align-items-center"
            >
              <span className="icon-play" />
            </NavLink>
          </div>
          <div className="col-md-7 py-5 wrap-about pb-md-5 ftco-animate">
            <div className="heading-section heading-section-wo-line pt-md-5 pl-md-5 mb-5">
              <div className="ml-md-0">
                <h2 className="mb-4">Chào mừng bạn đến với H&H</h2>
              </div>
            </div>
            <div className="pb-md-5">
              <p>
              Tại đây, chúng tôi cung cấp hàng trăm khóa học đa dạng thuộc lĩnh vực công nghệ thông tin,được xây dựng bởi đội ngũ
              hàng đầu.Dù bạn là người mới bắt đầu hay chuyên gia muốn nâng cao kỹ năng, H&H
              sẽ là người bạn đồng hành trên hành trình phát triển của bạn.
              </p> 
              <ul className="ftco-social d-flex">
                <li className="ftco-animate">
                  <NavLink to="/">
                    <span className="icon-twitter" />
                  </NavLink>
                </li>
                <li className="ftco-animate">
                  <NavLink to="https://www.facebook.com/hau.nguyen.1410" target="_blank" >
                    <span className="icon-facebook" />
                  </NavLink>
                </li>
                <li className="ftco-animate">
                  <NavLink to="/">
                    <span className="icon-google-plus" />
                  </NavLink>
                </li>
                <li className="ftco-animate">
                  <NavLink to="https://www.instagram.com/haaju14.10/" target="_blank" >
                    <span className="icon-instagram" />
                  </NavLink>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SectionInformation;
