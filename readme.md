#Welcome to E-SUMMIT 2019 API

### The following is a guide on how using this API

---

##Users

1. Participants
2. Admins (Panel not created yet)

---

##Particapnts

```
    - Register for e-summit
        -Login
        -Signup
        -Verify Email
        -Request forgot password
        -Logout
    - Pay for e-summit
    - Visit Dashboard
    - Choose Sessions
    - Get QR Code
```

---

##Admins

```
    - Find User data
        - By email
        - By e-summit id
        - By Phone no.
        - By QR code
    - Update live user status
```

---

##Routes

```
    -/api/signup - **POST**
        -Expects
            -name
            -email
            -password
        -Result
            -Verification link to email
            -success: 'Verification Link Sent'
            -error(only if error exits)
```

```
    -/api/login - **POST**
        -Expects
            -email
            -password
        -Result
            -Response header gets a x-auth-token
            -A session variable is set, named secure
            -success: 'Logged In'
            -error(only if error exits)
```

```
    -/api/profile - **POST**
        -Expects
            -fullName
            -alt_email
            -uni (For KIIT students, ensure name of university is - **kiit univesity**(imp))
            -roll
            -mob_no
            -w_mob_no
            -gender
            -year
        -Result
            -User profile gets filled
            -success: 'Profile has been saved'
            -error(only if error exists)
        -Middlewares
            -Cannot access without signup and login
```

```
    -/api/pay - **GET**
        -Results
            -Redirected to instamojo
                -Test Card Credentials
                    -Card Number - 4242 4242 4242 4242
                    -Expiry Date - 01/20
                    -CVV - 111
                    -3D Pin - 1221
            -Suceess
                -Redirects to /api/thankyou?mojo_id...&... - **GET**
                    -Updates the db
                    -Results
                        - Redirects to /api/dashboard/ - **GET**
                            -success: 'We have sved a seat for you'
                            -Reserves a seat for user
                            -error: (if any)
                                -Middelwares
                                    -User must be logged in
                                    -Profile must be complete
            -Failure
                -error: (if any)

                    
        -Middlewares
            -User should be logged in
            -Profile should be complete

```

```
    -/api/dashboard - **GET**
        -Results
            -success: 'welcome to dashboard'
            -error: (if any)
        -Middlewares
            -Must be logged in
            -Profile must be complete
            -Must have paid
            -Seat reserved
```

```
    -/api/dashboard/choose-events - **POST**
        -Expects
            -event1 - *S1_D1* or *S2_D1*
            -event2 - *S1_D2* or &S2_D2*
        -Results
            -Saves seats for users in chosen events
            -Generates user qr
        --Errors
            -if any
        --Middlewares
            -Must be logged in
            -Profile must be complete
            -Must have paid
            -Seat reserved
            -Events Chosen
```

```
    -/api/qr-gen - **GET**
        --Results
            -Send a token
        --Error
            -if any
        --Middlewares
            -Must be logged in
            -Profile must be complete
            -Must have paid
            -Seat reserved
            -Events Chosen
    

    -/api/qr-gen - **POST **
        -Expects
            -token
        -Results
            -userData
        -Error
            if any

```

### For any queries call me directly.
        


