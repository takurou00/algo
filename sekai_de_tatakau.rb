
### String

## 1.1 重複のない文字列

def uniq_string(s)
    if s.chars == s.chars.uniq
        puts true
    else
        puts false
    end
end

## 1.2 順列チェック

def sort_string(s,t)
    if s.chars.sort == t.chars.sort 
        puts true
    else
        puts false
    end
end

## 1.3 URLify

def URLify(s)
    puts s.gsub(/\s+/,'%20')
end

## 1.4 回文の順列

def palindrome(s)
    p s.reverse
end

## 1.5 一発変換



## 1.6 文字列圧縮

def string_compression(s)
    s = s.chars
    ans = []
    count = 0
 
    ans << s.first
    for i in 1..(s.size-1)
        if ans.last == s[i]
            count += 1
        else
            ans << count + 1
            ans << s[i]
            count = 0
        end
    end
    ans << count + 1 
    p ans.join("")
end

## 1.7 行列の回転


