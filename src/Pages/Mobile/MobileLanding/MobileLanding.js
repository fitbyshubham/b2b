import React from 'react'
import { Link } from 'react-router-dom'
import EdviLogo from '../../../Assets/Images/edvi-logo-blue.png'
import GooglePlay from '../../../Assets/Images/android.svg'
import AppStore from '../../../Assets/Images/appstore.svg'
import LiveClasses from '../../../Assets/Images/Interactive-Live-Classes.svg'
import OnePlace from '../../../Assets/Images/One-Place.svg'
import Fast from '../../../Assets/Images/Fast.svg'

const MobileLanding = () => (
  <div className="mobile-landing">
    <div className="mobile-landing__header">
      <h1 className="mobile-landing__header-heading">Welcome to</h1>
      <img src={EdviLogo} alt="Edvi" className="mobile-landing__header-img" />
      <div className="mobile-landing__header-auth">
        <Link to="/auth/register">
          <button className="mobile-landing__header-btn" type="button">
            Register
          </button>
        </Link>
        <Link to="/auth/login">
          <button className="mobile-landing__header-btn" type="button">
            Sign In
          </button>
        </Link>
      </div>
    </div>
    <div className="mobile-landing__download">
      <h3 className="mobile-landing__download-quote">
        “Unmatched AI powered digital classroom experience”
      </h3>
      <p className="mobile-landing__download-text">Download Mobile App</p>
      <div className="mobile-landing__download-stores">
        <a href="https://play.google.com/store/apps/details?id=app.edvi">
          <img
            src={GooglePlay}
            alt="Google Play"
            className="mobile-landing__download-stores__store"
          />
        </a>
        <img
          src={AppStore}
          alt="App Store"
          className="mobile-landing__download-stores__store"
        />
      </div>
    </div>
    <div className="mobile-landing__features">
      <h1 className="mobile-landing__features-heading">
        The Next Generation Online Teaching & Learning platform
      </h1>
      <div className="mobile-landing__features-feature">
        <img
          src={LiveClasses}
          alt="Live Classes"
          className="mobile-landing__features-feature__img"
        />
        <h2 className="mobile-landing__features-feature__heading">
          Interactive Live Classes
        </h2>
        <p className="mobile-landing__features-feature__about">
          Our live classes are specifically designed for educational use, making
          teaching/learning more effective & more fun.
        </p>
      </div>
      <div className="mobile-landing__features-feature">
        <img
          src={OnePlace}
          alt="One Place"
          className="mobile-landing__features-feature__img"
        />
        <h2 className="mobile-landing__features-feature__heading">
          One single place for Everything
        </h2>
        <p className="mobile-landing__features-feature__about">
          From Live classes to notes, homework, tests & much more, experience
          online Classes like never before.
        </p>
      </div>
      <div className="mobile-landing__features-feature">
        <img
          src={Fast}
          alt="Fast"
          className="mobile-landing__features-feature__img"
        />
        <h2 className="mobile-landing__features-feature__heading">
          Fast, Powerful, Simple & Secure!
        </h2>
      </div>
      <Link to="/auth/register">
        <button className="mobile-landing__features-btn" type="button">
          Get Started
        </button>
      </Link>
    </div>
    <div className="mobile-landing__footer">
      <h3 className="mobile-landing__footer-text">
        edvi: Teach. Share. Track - Hassle free!
      </h3>
      <p className="mobile-landing__footer-legal">Copyright 2021</p>
    </div>
  </div>
)

export default MobileLanding
