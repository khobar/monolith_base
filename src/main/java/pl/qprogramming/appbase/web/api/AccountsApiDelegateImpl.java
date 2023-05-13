package pl.qprogramming.appbase.web.api;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import pl.qprogramming.appbase.security.AuthoritiesConstants;
import pl.qprogramming.appbase.service.AccountService;
import pl.qprogramming.appbase.service.api.dto.AccountDTO;

@Service
@RequiredArgsConstructor
public class AccountsApiDelegateImpl implements pl.qprogramming.appbase.web.api.UsersApiDelegate {

    private final AccountService accountService;

    @Override
    @PreAuthorize("hasAuthority(\"" + AuthoritiesConstants.ADMIN + "\")")
    public ResponseEntity<Page> getAccounts(Pageable pageable) {
        return ResponseEntity.ok(accountService.getAllManagedUsers(pageable));
    }
}
