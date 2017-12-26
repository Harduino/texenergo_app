module Utils.Currency exposing (toCurrency)

import FormatNumber exposing (format)
import FormatNumber.Locales exposing (Locale)

rusLocale : Locale
rusLocale =
  Locale 2 " " "," "" ""

toCurrency : Float -> String
toCurrency f = 
  format rusLocale f |> (flip (++) " руб")