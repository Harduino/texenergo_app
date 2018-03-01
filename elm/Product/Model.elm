module Product.Model
    exposing
        ( Product
        , ProductId(..)
        , initProduct
        , productIdToString
        )


type ProductId
    = ProductId String


type alias Product =
    { id : ProductId
    , name : String
    , article : String
    }


productIdToString : ProductId -> String
productIdToString (ProductId str) =
    str


initProduct : Product
initProduct =
    Product (ProductId "") "" ""
