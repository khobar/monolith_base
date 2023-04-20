package pl.qprogramming.appbase.web.api;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import pl.qprogramming.appbase.service.AccountService;
import pl.qprogramming.appbase.service.api.dto.AccountDTO;

@Service
@RequiredArgsConstructor
public class AccountsApiDelegateImpl implements pl.qprogramming.appbase.web.api.UsersApiDelegate {

    private final AccountService accountService;

    @Override
    public ResponseEntity<List<AccountDTO>> getAccounts() {
        return ResponseEntity.ok(this.accountService.getAllUsers());
    }

}
