# Skipped Items

## SK1: Per-Role Notes
The original SupplierForm had per-role notes inputs. Phase 3 simplified to checkbox-only `{ role: type }` objects per the plan decision. Per-role notes can be added later if needed.

## SK2: Items Tab in Drawer
The Items tab (SuppliedItemRow table) was dropped from the drawer. Can be re-added as a separate tab/section outside the entity viewer.

## SK3: SupplierDrawer Edit Mode
The drawer's explicit `edit` mode was removed. The viewer handles edit mode internally via its Edit button. The drawer now only supports `view` and `add` modes.

## SK4: Postal Code Validation for Non-US/CA Countries
The `validateBusinessAffiliate` function only validates US (5/9 digit) and CA (A1A 1A1) postal codes. Other country formats are accepted without format validation.

## SK5: GeoLocation Editing
GeoLocation is displayed as read-only coordinates. Editing lat/long is not supported — would require a map widget or coordinate input.

## SK6: Multiple Contacts/Addresses
`BusinessAffiliate` has `contacts?: Record<string, Contact>` and `addresses?: Record<string, PostalAddress>` for multiple entries. Phase 3 only handles `contact` (singular) and `mainAddress`. Multi-contact/address support is deferred.
