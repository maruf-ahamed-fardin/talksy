function InstallHelpDialog({ isIos, isSafari, onClose }) {
  return (
    <div className="install-help-backdrop" onClick={onClose} role="presentation">
      <div
        aria-labelledby="install-help-title"
        aria-modal="true"
        className="install-help-dialog"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <span className="card-label">Install Talksy</span>
        <h3 id="install-help-title">
          {isIos ? 'Install on your iPhone or iPad' : 'Install from your browser menu'}
        </h3>
        <p>
          {isIos && isSafari
            ? 'Tap the Share button in Safari, then choose Add to Home Screen.'
            : null}
          {isIos && !isSafari
            ? 'Open this site in Safari first, then tap Share and choose Add to Home Screen.'
            : null}
          {!isIos
            ? 'If the native install prompt is not ready yet, open your browser menu and choose Install app or Add to Home screen. This also requires HTTPS or a production preview build.'
            : null}
        </p>
        <div className="install-help-steps">
          {isIos ? (
            <>
              <span>1. Open the browser share menu.</span>
              <span>2. Find Add to Home Screen.</span>
              <span>3. Confirm to install Talksy.</span>
            </>
          ) : (
            <>
              <span>1. Open the browser menu.</span>
              <span>2. Tap Install app or Add to Home screen.</span>
              <span>3. Accept the install prompt.</span>
            </>
          )}
        </div>
        <button className="nav-install install-help-close" onClick={onClose} type="button">
          Close
        </button>
      </div>
    </div>
  );
}

export default InstallHelpDialog;
