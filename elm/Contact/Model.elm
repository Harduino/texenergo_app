module Contact.Model
    exposing
        ( Contact
        , ContactId(..)
        , initContact
        )


type ContactId
    = ContactId String


type alias Contact =
    { id : ContactId
    , email : String
    , firstName : String
    , lastName : String
    , partnerId : String
    , role : String
    }


initContact : Contact
initContact =
    Contact (ContactId "") "" "" "" "" ""
