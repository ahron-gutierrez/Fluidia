function EditAccount() {
  return (
    <section className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-xl-10">
          <div className="mb-4">
            <p className="text-primary fw-semibold text-uppercase small mb-2">
              Account settings
            </p>
            <h1 className="h2 fw-bold mb-2">Edit your account</h1>
            <p className="text-secondary mb-0">
              Update your profile details and sign-in information.
            </p>
          </div>

          <div className="row g-4">
            <div className="col-12 col-lg-4">
              <section className="card shadow-sm h-100" aria-labelledby="profile-heading">
                <div className="card-body p-4">
                  <h2 id="profile-heading" className="h5 fw-semibold mb-4">
                    Your profile
                  </h2>
                  <div className="d-flex align-items-center gap-3 mb-4">
                    <div
                      className="rounded-circle bg-primary-subtle text-primary d-flex align-items-center justify-content-center fw-bold"
                      style={{ width: "4rem", height: "4rem", fontSize: "1.25rem" }}
                      aria-label="Profile initials: AM"
                    >
                      AM
                    </div>
                    <div>
                      <p className="fw-semibold mb-1">[Name]</p>
                      <p className="small text-secondary mb-0">Learner account</p>
                    </div>
                  </div>
                  <label htmlFor="profile-photo" className="form-label">
                    Profile photo
                  </label>
                  <input
                    id="profile-photo"
                    className="form-control"
                    type="file"
                    accept="image/*"
                    aria-describedby="photo-help"
                  />
                  <div id="photo-help" className="form-text">
                    Choose an image to use as your profile photo.
                  </div>
                </div>
              </section>
            </div>

            <div className="col-12 col-lg-8">
              <form>
                <section className="card shadow-sm mb-4" aria-labelledby="details-heading">
                  <div className="card-body p-4">
                    <h2 id="details-heading" className="h5 fw-semibold mb-4">
                      Personal information
                    </h2>
                    <div className="row g-3">
                      <div className="col-12 col-md-6">
                        <label htmlFor="account-first-name" className="form-label">
                          First name
                        </label>
                        <input
                          id="account-first-name"
                          className="form-control"
                          type="text"
                          autoComplete="given-name"
                          required
                        />
                      </div>
                      <div className="col-12 col-md-6">
                        <label htmlFor="account-last-name" className="form-label">
                          Last name
                        </label>
                        <input
                          id="account-last-name"
                          className="form-control"
                          type="text"
                          autoComplete="family-name"
                          required
                        />
                      </div>
                      <div className="col-12">
                        <label htmlFor="account-email" className="form-label">
                          Email address
                        </label>
                        <input
                          id="account-email"
                          className="form-control"
                          type="email"
                          autoComplete="email"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </section>

                <section className="card shadow-sm mb-4" aria-labelledby="password-heading">
                  <div className="card-body p-4">
                    <h2 id="password-heading" className="h5 fw-semibold mb-1">
                      Change password
                    </h2>
                    <p className="text-secondary small mb-4">
                      Leave these fields blank if you do not want to change your password.
                    </p>
                    <div className="row g-3">
                      <div className="col-12">
                        <label htmlFor="account-current-password" className="form-label">
                          Current password
                        </label>
                        <input
                          id="account-current-password"
                          className="form-control"
                          type="password"
                          autoComplete="current-password"
                        />
                      </div>
                      <div className="col-12 col-md-6">
                        <label htmlFor="account-new-password" className="form-label">
                          New password
                        </label>
                        <input
                          id="account-new-password"
                          className="form-control"
                          type="password"
                          autoComplete="new-password"
                        />
                      </div>
                      <div className="col-12 col-md-6">
                        <label htmlFor="account-confirm-password" className="form-label">
                          Confirm new password
                        </label>
                        <input
                          id="account-confirm-password"
                          className="form-control"
                          type="password"
                          autoComplete="new-password"
                        />
                      </div>
                    </div>
                  </div>
                </section>

                <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3">
                  <p className="small text-secondary mb-0">
                  </p>
                  <div className="d-flex gap-2">
                    <button className="btn btn-outline-secondary" type="reset">
                      Cancel
                    </button>
                    <button className="btn btn-primary" type="button">
                      Save changes
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default EditAccount;
