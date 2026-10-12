
import { useEffect, useState } from 'react'
import './App.css'

const OTP_DURATION = 60
const MAX_ATTEMPTS = 5
const MAX_RESENDS = 3

function App() {
  const [name, setName] = useState('')
  const [mobile, setMobile] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [acceptedTerms, setAcceptedTerms] = useState(false)

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [touched, setTouched] = useState({})
  const [step, setStep] = useState('form')

  const [otp, setOtp] = useState('')
  const [demoOtp, setDemoOtp] = useState('')
  const [secondsLeft, setSecondsLeft] = useState(OTP_DURATION)
  const [attempts, setAttempts] = useState(0)
  const [resends, setResends] = useState(0)
  const [otpMessage, setOtpMessage] = useState('')
  const [otpLocked, setOtpLocked] = useState(false)

  const validateName = (value) => {
    const clean = value.trim().replace(/\s+/g, ' ')
    if (!clean) return 'Name is required'
    if (!/^[A-Za-z ]+$/.test(clean)) return 'Use alphabets and spaces only'
    if (clean.length < 3) return 'Name must contain at least 3 characters'
    return ''
  }

  const validateMobile = (value) => {
    if (!value) return 'Mobile number is required'
    if (!/^[6-9]\d{9}$/.test(value)) return 'Enter a valid 10-digit Indian mobile number'
    return ''
  }

  const validateEmail = (value) => {
    const clean = value.trim().toLowerCase()
    if (!clean) return 'Email is required'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(clean)) return 'Enter a valid email address'
    return ''
  }

  const validatePassword = (value) => {
    if (!value) return 'Password is required'
    if (value.length < 8) return 'Use at least 8 characters'
    if (!/[A-Z]/.test(value)) return 'Add an uppercase letter'
    if (!/[a-z]/.test(value)) return 'Add a lowercase letter'
    if (!/[0-9]/.test(value)) return 'Add a number'
    if (!/[^A-Za-z0-9]/.test(value)) return 'Add a special character'
    return ''
  }

  const nameError = validateName(name)
  const mobileError = validateMobile(mobile)
  const emailError = validateEmail(email)
  const passwordError = validatePassword(password)
  const confirmError = !confirmPassword
    ? 'Please confirm your password'
    : password !== confirmPassword
      ? 'Passwords do not match'
      : ''

  const passwordStrength = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[a-z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ].filter(Boolean).length

  const formValid =
    !nameError &&
    !mobileError &&
    !emailError &&
    !passwordError &&
    !confirmError &&
    acceptedTerms

  const markTouched = (field) => {
    setTouched((previous) => ({ ...previous, [field]: true }))
  }

  // OTP countdown
  useEffect(() => {
    if (step !== 'otp' || secondsLeft <= 0 || otpLocked) return

    const timerId = setTimeout(() => {
      setSecondsLeft((seconds) => seconds - 1)
    }, 1000)

    return () => clearTimeout(timerId)
  }, [step, secondsLeft, otpLocked])

  const generateOtp = () => String(Math.floor(100000 + Math.random() * 900000))

  const handleReview = (event) => {
    event.preventDefault()

    setTouched({
      name: true,
      mobile: true,
      email: true,
      password: true,
      confirmPassword: true,
      terms: true,
    })

    if (!formValid) return
    setStep('summary')
  }

  const handleSendOtp = () => {
    const newOtp = generateOtp()
    setDemoOtp(newOtp)
    setOtp('')
    setSecondsLeft(OTP_DURATION)
    setAttempts(0)
    setResends(0)
    setOtpMessage('')
    setOtpLocked(false)
    setStep('otp')
  }

  const handleVerifyOtp = (event) => {
    event.preventDefault()

    if (otpLocked) return

    if (secondsLeft <= 0) {
      setOtpMessage('OTP expired. Please resend a new OTP.')
      return
    }

    if (otp.length !== 6) {
      setOtpMessage('Please enter all 6 digits.')
      return
    }

    if (otp !== demoOtp) {
      const nextAttempts = attempts + 1
      setAttempts(nextAttempts)
      setOtpMessage(`Incorrect OTP. ${MAX_ATTEMPTS - nextAttempts} attempt(s) remaining.`)

      if (nextAttempts >= MAX_ATTEMPTS) {
        setOtpLocked(true)
        setOtpMessage('Too many incorrect attempts. Please restart registration.')
      }
      return
    }

    // Demo only: save non-password details in this browser
    const registration = {
      name: name.trim().replace(/\s+/g, ' '),
      mobile,
      email: email.trim().toLowerCase(),
      registeredAt: new Date().toISOString(),
      verified: true,
    }

    try {
      const saved = JSON.parse(localStorage.getItem('cusRegistrations') || '[]')
      saved.push(registration)
      localStorage.setItem('cusRegistrations', JSON.stringify(saved))
      setStep('success')
    } catch {
      setOtpMessage('Could not save registration in this browser. Please check storage settings.')
    }
  }

  const handleResendOtp = () => {
    if (resends >= MAX_RESENDS || otpLocked) return

    setDemoOtp(generateOtp())
    setOtp('')
    setSecondsLeft(OTP_DURATION)
    setResends((count) => count + 1)
    setOtpMessage('New demo OTP generated.')
  }

  const handleReset = () => {
    setName('')
    setMobile('')
    setEmail('')
    setPassword('')
    setConfirmPassword('')
    setAcceptedTerms(false)
    setShowPassword(false)
    setShowConfirmPassword(false)
    setTouched({})
    setStep('form')
    setOtp('')
    setDemoOtp('')
    setSecondsLeft(OTP_DURATION)
    setAttempts(0)
    setResends(0)
    setOtpMessage('')
    setOtpLocked(false)
  }

  const goBackToForm = () => {
    setStep('form')
    setOtp('')
    setDemoOtp('')
    setOtpMessage('')
  }

  if (step === 'success') {
    return (
      <main className="registration-page">
        <section className="registration-card success-card">
          <div className="success-icon" aria-hidden="true">✓</div>
          <p className="eyebrow">CUSTOMER PORTAL</p>
          <h1>Registration Successful!</h1>
          <p className="subtitle">Your demo OTP was verified successfully.</p>
          <div className="summary">
            <p><strong>Name:</strong> {name.trim()}</p>
            <p><strong>Mobile:</strong> {mobile}</p>
            <p><strong>Email:</strong> {email.trim().toLowerCase()}</p>
            <p><strong>Status:</strong> Verified</p>
          </div>
          <p className="notice">
            Demo project: details are saved in this browser only. No server account was created.
          </p>
          <button type="button" onClick={handleReset}>Back to Registration</button>
        </section>
      </main>
    )
  }

  if (step === 'summary') {
    return (
      <main className="registration-page">
        <section className="registration-card">
          <div className="logo">CUS</div>
          <p className="eyebrow">STEP 2 OF 3</p>
          <h1>Review Your Details</h1>
          <p className="subtitle">Check your information before OTP verification.</p>

          <div className="summary">
            <p><strong>Full Name:</strong> {name.trim()}</p>
            <p><strong>Mobile Number:</strong> {mobile}</p>
            <p><strong>Email Address:</strong> {email.trim().toLowerCase()}</p>
            <p><strong>Password:</strong> •••••••• (hidden)</p>
          </div>

          <p className="notice">
            A demo OTP will be generated for this practice project. It will not be sent by SMS or email.
          </p>

          <button type="button" onClick={handleSendOtp}>Confirm &amp; Generate OTP</button>
          <button type="button" className="reset-button" onClick={goBackToForm}>
            Edit Details
          </button>
        </section>
      </main>
    )
  }

  if (step === 'otp') {
    return (
      <main className="registration-page">
        <section className="registration-card">
          <div className="logo">CUS</div>
          <p className="eyebrow">STEP 3 OF 3</p>
          <h1>Verify Your OTP</h1>
          <p className="subtitle">Enter the 6-digit demo OTP to complete registration.</p>

          <div className="demo-otp">
            <strong>Demo OTP: {demoOtp}</strong>
            <span>For testing only — not sent to your phone or email.</span>
          </div>

          <form onSubmit={handleVerifyOtp} noValidate>
            <div className="form-group">
              <label htmlFor="otp">6-digit OTP</label>
              <input
                type="text"
                id="otp"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                placeholder="Enter 6-digit OTP"
                value={otp}
                disabled={otpLocked}
                onChange={(event) => {
                  setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))
                  setOtpMessage('')
                }}
                aria-describedby="otp-message"
              />
            </div>

            <p className={`otp-timer ${secondsLeft === 0 ? 'expired' : ''}`}>
              {secondsLeft > 0
                ? `OTP expires in 00:${String(secondsLeft).padStart(2, '0')}`
                : 'OTP expired'}
            </p>

            {otpMessage && (
              <p id="otp-message" className="otp-message" role="status">{otpMessage}</p>
            )}

            <p className="attempt-info">
              Attempts used: {attempts}/{MAX_ATTEMPTS}
            </p>

            <button
              type="submit"
              disabled={otpLocked || secondsLeft === 0 || otp.length !== 6}
            >
              Verify OTP
            </button>

            <button
              type="button"
              className="reset-button"
              onClick={handleResendOtp}
              disabled={otpLocked || resends >= MAX_RESENDS}
            >
              {resends >= MAX_RESENDS
                ? 'Resend Limit Reached'
                : `Resend OTP (${MAX_RESENDS - resends} left)`}
            </button>

            <button type="button" className="text-button" onClick={goBackToForm}>
              Back to Registration
            </button>
          </form>

          {otpLocked && (
            <button type="button" onClick={handleReset}>Restart Registration</button>
          )}
        </section>
      </main>
    )
  }

  return (
    <main className="registration-page">
      <section className="registration-card">
        <div className="logo">CUS</div>
        <p className="eyebrow">CUSTOMER PORTAL</p>
        <h1>Create Your Account</h1>
        <p className="subtitle">Register to access our marketplace services.</p>

        <form onSubmit={handleReview} noValidate>
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              value={name}
              maxLength={50}
              autoComplete="name"
              placeholder="Enter your full name"
              onChange={(event) => setName(event.target.value.replace(/\s+/g, ' '))}
              onBlur={() => markTouched('name')}
              className={touched.name ? (nameError ? 'input-error' : 'input-success') : ''}
              aria-invalid={touched.name && !!nameError}
              aria-describedby="name-error"
            />
            <div className="field-info">
              <span id="name-error" className="error-message">
                {touched.name && nameError}
              </span>
              <span className="counter">{name.length}/50</span>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="mobile">Mobile Number</label>
            <input
              type="tel"
              id="mobile"
              value={mobile}
              maxLength={10}
              inputMode="numeric"
              autoComplete="tel-national"
              placeholder="Enter 10-digit mobile number"
              onChange={(event) => setMobile(event.target.value.replace(/\D/g, '').slice(0, 10))}
              onBlur={() => markTouched('mobile')}
              className={touched.mobile ? (mobileError ? 'input-error' : 'input-success') : ''}
              aria-invalid={touched.mobile && !!mobileError}
              aria-describedby="mobile-error"
            />
            <div className="field-info">
              <span id="mobile-error" className="error-message">
                {touched.mobile && mobileError}
              </span>
              <span className="counter">{mobile.length}/10 digits</span>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              autoComplete="email"
              placeholder="Enter your email"
              onChange={(event) => setEmail(event.target.value.toLowerCase())}
              onBlur={() => {
                setEmail((previous) => previous.trim().toLowerCase())
                markTouched('email')
              }}
              className={touched.email ? (emailError ? 'input-error' : 'input-success') : ''}
              aria-invalid={touched.email && !!emailError}
              aria-describedby="email-error"
            />
            <span id="email-error" className="error-message">
              {touched.email && emailError}
            </span>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="password-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                autoComplete="new-password"
                placeholder="Create a password"
                onChange={(event) => setPassword(event.target.value)}
                onBlur={() => markTouched('password')}
                className={touched.password ? (passwordError ? 'input-error' : 'input-success') : ''}
                aria-invalid={touched.password && !!passwordError}
                aria-describedby="password-error"
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>

            <div className="strength-track">
              <div
                className={`strength-fill strength-${passwordStrength}`}
                style={{ width: `${passwordStrength * 20}%` }}
              />
            </div>
            <p className="strength-label">
              {!password
                ? 'Password strength'
                : passwordStrength <= 2
                  ? 'Weak'
                  : passwordStrength <= 4
                    ? 'Medium'
                    : 'Strong'}
            </p>
            <span id="password-error" className="error-message">
              {touched.password && passwordError}
            </span>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div className="password-wrapper">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                value={confirmPassword}
                autoComplete="new-password"
                placeholder="Confirm your password"
                onChange={(event) => setConfirmPassword(event.target.value)}
                onBlur={() => markTouched('confirmPassword')}
                className={touched.confirmPassword ? (confirmError ? 'input-error' : 'input-success') : ''}
                aria-invalid={touched.confirmPassword && !!confirmError}
                aria-describedby="confirm-password-error"
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowConfirmPassword((value) => !value)}
                aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
              >
                {showConfirmPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            <span id="confirm-password-error" className="error-message">
              {touched.confirmPassword && confirmError}
            </span>
          </div>

          <div className="terms-section">
            <label className="terms">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(event) => setAcceptedTerms(event.target.checked)}
                onBlur={() => markTouched('terms')}
                aria-invalid={touched.terms && !acceptedTerms}
              />
              <span>I agree to the <strong>Terms &amp; Conditions</strong></span>
            </label>
            {touched.terms && !acceptedTerms && (
              <span className="error-message">
                You must accept the Terms &amp; Conditions
              </span>
            )}
          </div>

          <button type="submit" disabled={!formValid}>Review Registration</button>
          <button type="button" className="reset-button" onClick={handleReset}>
            Reset
          </button>
        </form>
      </section>
    </main>
  )
}

export default App

