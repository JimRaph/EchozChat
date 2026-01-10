import { useState, useRef } from 'react';
import { User, SearchIcon, ToggleLeft } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import axios from 'axios';
import { base_url } from '../../utils/baseUrl';
import { useAppContext } from '../context/context';
import { useEffect } from 'react';

const schema = yup.object().shape({
  Phone: yup.string().required('Phone number is required'),
  first_name: yup.string().required('First name is required'),
  last_name: yup.string().required('Last name is required'),
}).required();

const countryCodes = [
  { name: 'Nigeria', code: '+234', flag: '🇳🇬' },
  { name: 'United States', code: '+1', flag: '🇺🇸' },
  { name: 'United Kingdom', code: '+44', flag: '🇬🇧' },
  { name: 'Canada', code: '+1', flag: '🇨🇦' },
  { name: 'Germany', code: '+49', flag: '🇩🇪' },
  { name: 'France', code: '+33', flag: '🇫🇷' },
  { name: 'India', code: '+91', flag: '🇮🇳' },
  { name: 'Australia', code: '+61', flag: '🇦🇺' },
  { name: 'China', code: '+86', flag: '🇨🇳' },
];

const NewContactModal = ({ onClose }) => {

  const modalRef = useRef();
  const dropdownRef = useRef();
  const [search, setSearch] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(countryCodes[0]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [error, setError] = useState(null)
  const {setContact} = useAppContext() 

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
  });

  const handleClickOutside = (event) => {
    if (modalRef.current && !modalRef.current.contains(event.target)) {
      onClose();
    }
  };

  const handleDropdownClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setShowDropdown(false);
    }
  };

  useEffect(() => {
    document.addEventListener('click', handleDropdownClickOutside);
    return () => {
      document.removeEventListener('click', handleDropdownClickOutside);
    };
  }, []);

  const onSubmit = async (formdata) => {
    // console.log('Form Submitted:', { ...formdata, country_code: selectedCountry.code });
    if(!localStorage.getItem('whatsapp-token')){
      // console.log("Token does not exists in local storage")
      return
    }
    
    try {
      setError(null)

      const { data } = await axios.post(
        `${base_url}/users/contacts`, 
        {
          Phone: formdata.Phone,
          first_name: formdata.first_name,
          last_name: formdata.last_name,
        },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('whatsapp-token')}`
          }
        }
      );
      
      console.log(data)
      if(data.success){
        setContact(prev => [...prev, data.contact])
        // console.log("Contact added: ", data.contact)
        setError(null)
        onClose();
      }else{
        // console.log("Failed to add contact: ", data.response.message)
        setError(data.response.message)
      }
    } catch (error) {
      console.log("Error from onSubmit func in NewContactModal file: ", error)
       setError(error.response.data.message)
    }
    // finally{
    //   onClose();
    // }
    // onClose();
  };

  useEffect(() => {
    if (error) {
        const timer = setTimeout(() => {
        setError('');
        }, 3000); 
        return () => clearTimeout(timer); 
    }
}, [error]);

  return (
    <div onClick={handleClickOutside} className='absolute w-svw h-svh flex flex-col justify-center items-center bg-black/50 text-white z-5'>
      <div ref={modalRef} className='flex flex-col space-y-4 min-w-md bg-[#111b21] p-6 rounded-lg shadow-lg'>
        <h2 className="text-lg font-bold mb-4">New Contact</h2>
        <p className='m-auto rounded-full bg-[#274152] p-4'>
          <User size={40} />
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col space-y-4">
          {/* Country and Phone Number Section */}
          <label className='mb-1'>Phone Number</label>
          <div className='flex items-center space-x-2'>
            {/* Country Code Dropdown */}
            <div className='relative' ref={dropdownRef}>
              <button onClick={() => setShowDropdown(!showDropdown)} className='bg-[#274152] text-white px-4 py-2 rounded-md'>
                {selectedCountry.code}
              </button>

              {showDropdown && (
                <div className="absolute -left-11 p-4 mt-2 min-w-sm min-h-64 bg-[#111b21] border border-gray-600 rounded-md shadow-lg z-10">
                  <div className="flex items-center space-x-3 w-full pl-2 p-1 bg-[#222e35] text-white border-b-1 rounded-sm outline-none">
                    <SearchIcon size={15} />
                    <input
                      type="text"
                      placeholder="Search country/region"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="bg-transparent text-white w-full"
                    />
                  </div>

                  <div className="max-h-90 overflow-y-scroll custom-scrollbar">
                    {countryCodes
                      .filter((c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.code.includes(search))
                      .map((country) => (
                        <div
                          key={country.code}
                          className="mt-4 flex justify-between p-2 hover:bg-[#2d3b45] cursor-pointer"
                          onClick={() => {
                            setSelectedCountry(country);
                            setShowDropdown(false);
                          }}
                        >
                          <div className='flex items-center space-x-2'>
                            <p>{country.flag}</p>
                            <p>{country.name}</p>
                          </div>
                          <p>{country.code}</p>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>

           <input
              {...register('Phone')}
              type="telephone"
              onInput={(e) => {
                  e.target.value = e.target.value.replace(/\D/g, '');
                }}
              className='bg-[#274152] text-white rounded-md p-2 w-full'
              placeholder="Enter Phone number"
            />
          </div>
          {errors.Phone && <p className="text-red-500 text-xs">{errors.Phone.message}</p>}

          {/* Name Fields */}
          <label className='mb-1 mt-3'>First Name</label>
          <input
            {...register('first_name')}
            type="text"
            className='bg-[#274152] text-white rounded-md p-2'
            placeholder="Enter first name"
          />
          {errors.first_name && <p className="text-red-500 text-xs">{errors.first_name.message}</p>}

          <label className='mb-1 mt-3'>Last Name</label>
          <input
            {...register('last_name')}
            type="text"
            className='bg-[#274152] text-white rounded-md p-2'
            placeholder="Enter last name"
          />
          {errors.last_name && <p className="text-red-500 text-xs">{errors.last_name.message}</p>}

          {error && (
            <p className='text-red-500'>{error}</p>
          )}

          {/* Sync Contacts Toggle */}
          <div className='flex justify-between items-center'>
            <div className='text-xs'>
              <p className='text-sm font-semibold'>Sync contacts to Phone</p>
              <p>This contact will be added to your Phone&apos;s address book.</p>
            </div>
            <ToggleLeft size={30} />
          </div>

          {/* Buttons */}
          <div className='flex min-w-md rounded-b-lg items-center justify-around '>
            <button type="submit" className='w-[30%] bg-[#274152] text-white p-1 mt-5 mb-5 rounded-md'>Save</button>
            <button type="button" className='w-[30%] bg-[#818e97] text-white p-1 mt-5 mb-5 rounded-md' onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewContactModal;
