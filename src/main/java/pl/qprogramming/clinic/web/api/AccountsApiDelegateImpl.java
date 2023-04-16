package pl.qprogramming.clinic.web.api;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import pl.qprogramming.clinic.service.AccountService;
import pl.qprogramming.clinic.service.api.dto.AccountDTO;

@Service
@RequiredArgsConstructor
public class AccountsApiDelegateImpl implements UsersApiDelegate {

    private final AccountService accountService;

    @Override
    public ResponseEntity<List<AccountDTO>> getAccounts() {
        return ResponseEntity.ok(this.accountService.getAllUsers());
    }
}
