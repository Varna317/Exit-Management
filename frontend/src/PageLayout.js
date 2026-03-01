function PageLayout({ children }) {
  return (
    <div className="page-wrap">
      <div className="container">
        {children}
      </div>
    </div>
  );
}

export default PageLayout;
