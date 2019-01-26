# Welcome to E-SUMMIT 2019 API

### The following is a guide on using this API

---

## Users

1. Participants
2. Admins (Live Status feature left to add)

---

### **Note** : Each route sends a success (bool) and message response. 

###          : Check out  Client Authentication and Profile section (major updates)
          

---


## Client Authentication (updated)

---

```
    In order to ensure that the API is not being misused, I have added this particular method.

    How it works?

    Every client *on their own* will generate an x-api-token and send it as their response header. If the token is verified then,
    we allow the request to move foward. 

    How to generate this token? 

    STEP 1 : get the current date (Format : ddmmyyyy)
    STEP 2 : add the valure of date%10^6 to the current date ( ddmmyyyy + mmyyyy)
    STEP 3: add a salt to the generated string (ddmmyyyy+ mmyy + salt)
    STEP 4 : encrypt the final string with sha256 (sha256(ddmmyyyy+ mmyy + salt))

    Example : 

    currentDate = 2612019
    dateMod6 = (2612019 + 612019) => 3224038
    finalString = 3224038 + salt
    x-api-token = sha256(finalString)

    +++++++++++++++++++++
    Salt = kiitesummitzgOrJz91QOME8hrislove


```

---

## Particapnts

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

## Admins

```
    - Find User data
        - By email
        - By e-summit id
        - By Phone no.
        - By QR code
    - Update live user status
```

---

## Routes

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

    -/api/profile - **GET**
        -Returns user profile
        -returns bool value like, profile Status,seats Selection status etc


    ===========================
    Profile verification added.
    ===========================
    Now a verification link will be sent to users kiit mail id, if they say they are from kiit. It would again act as an middleware.


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
    -/api/dashboard/choose-events - **GET**
        -Results
            -Get seat status


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
        -Middlewares
            -only for admins to post the token here and get the user data

```

```
    /api/logout - **GET**
        -Results
            -Logs user out
            -Destroys sessions
            -Destroys headers
```
---

### Admin Routes

```
    /api/admin/login - **POST **
        -Expects
            -email
            -password
        -Result
            -creates an admin user
            -sets an x-auth-token and id of the current user in session
        -Errors
            -if any
    
    /api/admin/create-admin - **POST**
        -Expects
            -email
            -password
        -Middlewares
            -A admin should always be present to create other admins (current I have manually added an admin user, if you need the creds for testing the contact me)
        -Result
            -Creates an admin
        -Error
            -if any

``` 
---

## Google Authentication

---

```
    /api/auth/google - **GET**
        -Here you will get the url from google to login use it in the button
    
    /api/auth/google/callback - **GET**
        -THIS IS WHERE MAGIC HAPPENS :D
        -Here the user will be logged in depending upon what he has done
        -currently only it's saying success true or false
        -later on we will redirect the user to /dashboard



```    




### For any queries call me directly.
        


