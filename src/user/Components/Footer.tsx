import React from "react";
import { NavLink } from "react-router-dom";
import '../../../public/user/css/style.css'

const Footer: React.FC = () => {
  return (
    <footer className="ftco-footer ftco-bg-dark ftco-section">
      <div className="container">
        <div className="row mb-5">
          <div className="col-md">
            <div className="ftco-footer-widget mb-4">
              <h2 className="ftco-heading-2">H&H</h2>
              <p>
              Chúng tôi cung cấp hàng ngàn khóa học đa dạng, từ cơ bản đến nâng cao, 
              giúp bạn phát triển kỹ năng và theo đuổi đam mê.
              Tham gia ngay để khám phá kiến thức mới và nâng tầm sự nghiệp của bạn!
              </p>
              <ul className="ftco-footer-social list-unstyled float-md-left float-lft mt-5">
                <li className="ftco-animate">
                  <NavLink to="#">
                    <span className="icon-twitter" />
                  </NavLink>
                </li>
                <li className="ftco-animate">
                  <NavLink to="https://www.facebook.com/hau.nguyen.1410" target="_blank">
                    <span className="icon-facebook" />
                  </NavLink>
                </li> 
                <li className="ftco-animate">
                  <NavLink to="https://www.instagram.com/haaju14.10/" target="_blank">
                    <span className="icon-instagram" />
                  </NavLink>
                </li>
              </ul>
            </div>
          </div>
          <div className="col-md">
            <div className="ftco-footer-widget mb-4 ml-md-5">
              <h2 className="ftco-heading-2">Useful Links</h2>
              <ul className="list-unstyled">
                <li>
                  <a href="#" className="py-2 d-block">
                    Blog
                  </a>
                </li>
                <li>
                  <NavLink to="/" className="py-2 d-block"  >
                    Course
                  </NavLink>
                </li>
                <li>
                  <a href="#" className="py-2 d-block">
                    Amenities
                  </a>
                </li>
                <li>
                  <a href="#" className="py-2 d-block">
                    Gift Card
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="col-md">
            <div className="ftco-footer-widget mb-4">
              <h2 className="ftco-heading-2">Privacy</h2>
              <ul className="list-unstyled">
                <li>
                  <a href="#" className="py-2 d-block">
                    Career
                  </a>
                </li>
                <li>
                  <a href="#" className="py-2 d-block">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="py-2 d-block">
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="#" className="py-2 d-block">
                    Services
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="col-md">
            <div className="ftco-footer-widget mb-4">
              <h2 className="ftco-heading-2">Have a Questions?</h2>
              <div className="block-23 mb-3">
              <ul>
                <li>
                  <span className="footer-icon icon-map-marker" />
                  <span className="footer-text">
                    Khu Công nghệ cao XL Hà Nội, Hiệp Phú, 
                    Quận 9, Hồ Chí Minh, Việt Nam
                  </span>
                </li>
                <li>
                  <a href="#">
                    <span className="footer-icon icon-phone" />
                    <span className="footer-text">+84 2854452222</span>
                  </a>
                </li>
                <li>
                  <a href="#">
                    <span className="footer-icon icon-envelope" />
                    <span className="footer-text">Hutech@gmail.com</span>
                  </a>
                </li>
              </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-md-12 text-center">
            <p>
              Copyright © All rights reserved
              <i
                className="icon-heart color-danger pl-1 pr-1"
                aria-hidden="true"
              />{" "}
              by
              <NavLink to="/" target="_blank">
                H&H
              </NavLink>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
