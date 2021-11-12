import React from 'react'
import Card from '../Cards/Card'

const ComingSoon = ({ src, content }) => (
  <Card className="coming-soon text-align-center">
    <div>
      <img src={src} alt="Coming Soon" className="coming-soon__img" />
    </div>
    <div className="coming-soon__text">
      <div className="coming-soon__text-heading">
        <h1>Coming Soon!</h1>
      </div>
      <div className="coming-soon__text-content">
        <h2>{content}</h2>
      </div>
    </div>
  </Card>
)

export default ComingSoon
