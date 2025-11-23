import React from 'react';
import './PageHeader.css';

const PageHeader = ({ title, subtitle, actions }) => {
  return (
    <div className="page-header">
      <div className="header-content">
        <div className="header-text">
          <h1>{title}</h1>
          {subtitle && <p>{subtitle}</p>}
        </div>
        {actions && <div className="header-actions">{actions}</div>}
      </div>
    </div>
  );
};

export default PageHeader;