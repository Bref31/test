Push-Location $PSScriptRoot
(
@'
DELIMITER //
CREATE OR REPLACE PROCEDURE INITIALIZE_DATABASE ()
BEGIN

'@ + (Get-Content -Raw smartlink.sql) + @'

END;
//
DELIMITER ;

'@
) | docker exec -i tests-db-1 sh -c 'mariadb -usmartlink -psmartlink smartlink'
Pop-Location
