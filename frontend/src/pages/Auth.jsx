import { useEffect, useState } from "react";
import {
  SmartphoneIcon,
  ChevronRightIcon,
  ChevronDown,
  Globe,
  Lock,
  Check,
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { base_url } from "../../utils/baseUrl";
import { countries } from "../data/countries";
import { isValidPhoneNumber } from "libphonenumber-js";

const AuthFlow = ({ onAuthenticated }) => {
  const [currentView, setCurrentView] = useState(() => {
    return localStorage.getItem("EchozChat-currentView") || "phone";
  });
  const [phoneNumber, setPhoneNumber] = useState("");

  const defaultCountry = countries.find((c) => c.code === "US") || countries[0];
  const [selectedCountry, setSelectedCountry] = useState(defaultCountry);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [verificationCode, setVerificationCode] = useState();
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "Dark";
  });
  const [error, setError] = useState("");

  // Handle phone number submission
  const handlePhoneSubmit = async (e) => {
    e.preventDefault();
    console.log("base_url: ", base_url);

    // Validation
    const testNumbers = ["1234", "2233", "5678"];
    const isTestNumber = testNumbers.includes(phoneNumber);

    if (!isTestNumber) {
      if (!isValidPhoneNumber(phoneNumber, selectedCountry.code)) {
        setError(`Invalid phone number for ${selectedCountry.name}`);
        return;
      }
    }

    try {
      const payloadPhone = isTestNumber
        ? phoneNumber
        : selectedCountry.dial_code + phoneNumber;

      const response = await axios.post(base_url + "/auth/register", {
        Phone: payloadPhone,
      });
      if (response.data.success) {
        if (response.data.otp) {
          setVerificationCode(response.data.otp);
        } else {
          setVerificationCode(null);
          toast.success("OTP sent via SMS");
        }
        setCurrentView("otp");
      } else {
        toast.error(response?.data?.message || "Something went wrong");
      }
    } catch (err) {
      // console.log('eww:', err.response?.data?.message || err.message);
      setError(err.response?.data?.message || "An error occurred");
    }
  };

  // handle OTP digit input
  const handleOtpChange = (index, value) => {
    if (value.length > 1) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // auto focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  // Handle OTP submission
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    try {
      const testNumbers = ["1234", "2233", "5678"];
      const isTestNumber = testNumbers.includes(phoneNumber);
      const payloadPhone = isTestNumber
        ? phoneNumber
        : selectedCountry.dial_code + phoneNumber;

      const { data } = await axios.post(base_url + "/auth/verify", {
        phone: payloadPhone,
        otp: otp.join(""),
      });

      if (data.success) {
        localStorage.setItem("EchozChat-token", data.token);
        localStorage.setItem("EchozChat-user", JSON.stringify(data.user));
        localStorage.removeItem("EchozChat-currentView");
        onAuthenticated();
      } else {
        toast.error(data?.message || "Something went wrong");
      }
    } catch (error) {
      // console.log('eww:', error.response?.data?.message || error.message);
      setError(error.response?.data?.message || "An error occurred");
    }
  };

  useEffect(() => {
    localStorage.setItem("EchozChat-currentView", currentView);
  }, [currentView]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError("");
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [error]);

  return (
    <div
      className={`min-h-screen ${
        theme === "Dark" ? "bg-[#202C33]" : "bg-[#FFFFFF]"
      } ${theme.textPrimary} flex flex-col`}
    >
      {/* EchozChat Header */}
      <header
        className={`${
          theme === "Dark" ? "bg-[#111B21]" : "bg-[#F3F3F3]"
        } p-4 text-center`}
      >
        <h1 className="text-xl font-semibold text-[#00a884]">EchozChat</h1>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto px-4">
        {currentView === "phone" ? (
          /* Phone Number Input Step */
          <div className="w-full">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <SmartphoneIcon size={64} className="text-[#00a884]" />
              </div>
              <h2
                className={`${
                  theme === "Dark" ? "text-gray-50" : ""
                } text-2xl font-semibold mb-2`}
              >
                Enter your phone number
              </h2>
              <p className="text-gray-400">
                Log in or Sign up with your phone number.
              </p>
            </div>

            <form onSubmit={handlePhoneSubmit} className="space-y-4">
              {/* Country Selection  */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                  className={`w-full flex items-center justify-between p-3 rounded ${
                    theme === "Dark"
                      ? "bg-[#394f5e] text-gray-50"
                      : "bg-[#F3F3F3] text-black"
                  } outline-none`}
                >
                  <div className="flex items-center space-x-2 overflow-hidden">
                    <Globe className="text-[#00a884] flex-shrink-0" size={20} />
                    <span className="truncate">
                      {selectedCountry.name} ({selectedCountry.dial_code})
                    </span>
                  </div>
                  <ChevronDown
                    size={20}
                    className={`${
                      theme.textSecondary
                    } flex-shrink-0 transition-transform ${
                      showCountryDropdown ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {showCountryDropdown && (
                  <div
                    className={`absolute left-0 top-full mt-1 w-full max-h-60 overflow-y-auto rounded shadow-lg z-50 ${
                      theme === "Dark"
                        ? "bg-[#2a3942] text-gray-50"
                        : "bg-white text-black"
                    }`}
                  >
                    {countries.map((country) => (
                      <div
                        key={country.code}
                        onClick={() => {
                          setSelectedCountry(country);
                          setShowCountryDropdown(false);
                        }}
                        className={`p-3 cursor-pointer flex items-center justify-between ${
                          theme === "Dark"
                            ? "hover:bg-[#202c33]"
                            : "hover:bg-gray-100"
                        }`}
                      >
                        <span>
                          {country.name} ({country.dial_code})
                        </span>
                        {selectedCountry.code === country.code && (
                          <Check size={16} className="text-[#00a884]" />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Phone Number Input */}
              <div
                className={`flex items-center p-3 ${
                  theme === "Dark"
                    ? "bg-[#394f5e] text-gray-50"
                    : "bg-[#F3F3F3]"
                } rounded`}
              >
                <span
                  className={`mr-2 ${
                    theme === "Dark" ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  {selectedCountry.dial_code}
                </span>
                <input
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={phoneNumber}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    setPhoneNumber(value);
                  }}
                  placeholder="Your phone number"
                  className={`w-full bg-transparent outline-none ${
                    theme === "Dark" ? "text-gray-50" : "text-black"
                  }`}
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#00a884] text-white py-3 rounded flex items-center justify-center space-x-2"
              >
                <span>Next</span>
                <ChevronRightIcon size={20} />
              </button>
            </form>
            {error && (
              <p className="text-red-500 text-sm mt-1 text-center">{error}</p>
            )}

            <div className="mt-6 text-center text-sm text-gray-400">
              <Lock size={16} className="inline mr-1" />
              Your data is securely encrypted
            </div>
          </div>
        ) : (
          /* OTP Verification Step */
          <div className="w-full">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <Lock size={64} className="text-[#00a884]" />
              </div>
              <h2
                className={` ${
                  theme === "Dark" ? "text-gray-50" : ""
                } text-2xl font-semibold mb-2`}
              >
                Enter verification code
              </h2>
              <p
                className={` ${theme.textSecondary} ${
                  theme === "Dark" ? "text-gray-400" : ""
                } `}
              >
                We sent a code to{" "}
                {["1234", "2233", "5678"].includes(phoneNumber)
                  ? phoneNumber
                  : selectedCountry.dial_code + phoneNumber}
              </p>
              {verificationCode && (
                <p
                  className={` ${theme.textSecondary} ${
                    theme === "Dark" ? "text-gray-400" : ""
                  }`}
                >
                  code: {verificationCode}
                </p>
              )}
            </div>

            <form onSubmit={handleOtpSubmit} className="space-y-6">
              {/* OTP Input Fields */}
              <div className="flex justify-between mb-8">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => {
                      const value = e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 1);
                      handleOtpChange(index, value);
                    }}
                    className={`w-12 h-12 text-center ${
                      theme === "Dark" ? "bg-[#111B21]" : "bg-[#F3F3F3]"
                    }
                     rounded-lg mx-1 text-xl ${
                       theme === "Dark" ? "text-gray-50" : ""
                     }`}
                  />
                ))}
              </div>

              <button
                type="submit"
                className="w-full bg-[#00a884] text-white py-3 rounded flex items-center justify-center space-x-2"
              >
                <span>Verify</span>
                <Check size={20} />
              </button>
            </form>
            {error && (
              <p className="text-red-500 text-sm mt-1 text-center">{error}</p>
            )}

            <div className="mt-6 text-center">
              <button
                onClick={() => setCurrentView("phone")}
                className="text-[#00a884]"
              >
                Wrong number?
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthFlow;
